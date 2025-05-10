import 'package:flutter/foundation.dart';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:file_picker/file_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:path_provider/path_provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:typed_data';
import 'dart:html' as html;

class ProfileScreen extends StatefulWidget {
  final Map<String, dynamic> userInfo;

  const ProfileScreen({super.key, required this.userInfo});

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String? userId;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _qualificationController = TextEditingController();

  bool isEditable = false;
  bool isLoading = false;

  String selectedDocType = 'ID';
  List<Map<String, String>> uploadedDocuments = [];

  @override
  void initState() {
    super.initState();
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      userId = user.uid;
      _initializeProfile();
    } else {
      _showSnackBar('No user signed in.');
    }
  }

  void _initializeProfile() async {
    try {
      DocumentSnapshot userProfile =
      await FirebaseFirestore.instance.collection('users').doc(userId).get();

      final data = userProfile.data() as Map<String, dynamic>?;

      setState(() {
        _nameController.text = data?['name'] ?? widget.userInfo['fullName'] ?? '';
        _emailController.text = data?['email'] ?? widget.userInfo['email'] ?? '';
        _qualificationController.text =
            data?['qualification'] ?? widget.userInfo['qualification'] ?? '';
      });
    } catch (e) {
      debugPrint('Error loading profile: $e');
      setState(() {
        _nameController.text = widget.userInfo['fullName'] ?? '';
        _emailController.text = widget.userInfo['email'] ?? '';
        _qualificationController.text = widget.userInfo['qualification'] ?? '';
      });
    }
  }

  Future<void> saveProfileToFirestore() async {
    if (userId == null) return;
    try {
      await FirebaseFirestore.instance.collection('users').doc(userId).set({
        'name': _nameController.text,
        'email': _emailController.text,
        'qualification': _qualificationController.text,
      }, SetOptions(merge: true));
      _showSnackBar('Profile updated successfully!');
    } catch (e) {
      _showSnackBar('Error saving profile: $e');
    }
  }

  Future<void> deleteProfile() async {
    if (userId == null) return;
    try {
      await FirebaseFirestore.instance.collection('users').doc(userId).delete();
      await FirebaseAuth.instance.currentUser?.delete();
      _showSnackBar('Profile deleted successfully.');
      Navigator.of(context).pushReplacementNamed('/');
    } catch (e) {
      _showSnackBar('Error deleting profile: $e');
    }
  }

  void confirmDeleteProfile() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Deletion'),
        content: const Text('Are you sure you want to delete your profile? This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(onPressed: () {
            Navigator.pop(context);
            deleteProfile();
          }, child: const Text('Delete', style: TextStyle(color: Colors.red)))
        ],
      ),
    );
  }

  Future<void> _uploadDocument() async {
    setState(() => isLoading = true);

    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true,
      );

      if (result == null) {
        _showSnackBar('No file selected.');
        return;
      }

      final file = result.files.first;

      if (file.size > 5 * 1024 * 1024) {
        _showSnackBar('File size exceeds 5MB.');
        return;
      }

      if (kIsWeb) {
        setState(() {
          uploadedDocuments.add({
            'name': file.name,
            'path': '',
            'type': selectedDocType,
          });
        });
        _showSnackBar('$selectedDocType uploaded (web only, not saved)');
      } else {
        await requestPermission();

        final appDir = await getApplicationDocumentsDirectory();
        final uniqueName = '${DateTime.now().millisecondsSinceEpoch}_${file.name}';
        final copiedFile = await File(file.path!).copy('${appDir.path}/$uniqueName');

        setState(() {
          uploadedDocuments.add({
            'name': file.name,
            'path': copiedFile.path,
            'type': selectedDocType,
          });
        });

        _showSnackBar('$selectedDocType uploaded successfully!');
      }
    } catch (e) {
      _showSnackBar('Upload failed: $e');
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> requestPermission() async {
    if (kIsWeb) return;

    var status = await Permission.storage.status;
    if (!status.isGranted) {
      var result = await Permission.storage.request();
      if (result.isPermanentlyDenied) {
        _showSnackBar('Storage permission denied. Please enable it in settings.');
        await openAppSettings();
      }
    }
  }

  Future<void> _openFile(String path) async {
    if (kIsWeb || path.isEmpty) {
      _showSnackBar('Opening documents is not supported in this version.');
      return;
    }

    final fileUri = Uri.file(path);
    if (await canLaunchUrl(fileUri)) {
      await launchUrl(fileUri);
    } else {
      _showSnackBar('Could not open document.');
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  void _navigateToDashboard() {
    saveProfileToFirestore();
    Navigator.of(context).pushReplacementNamed('/user_dashboard');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Profile')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.person, size: 24),
                  SizedBox(width: 8),
                  Text('Profile Info', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
              const Divider(height: 20),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
                readOnly: !isEditable,
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
                readOnly: !isEditable,
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _qualificationController,
                decoration: const InputDecoration(labelText: 'Qualification', border: OutlineInputBorder()),
                readOnly: !isEditable,
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() => isEditable = !isEditable);
                      if (!isEditable) saveProfileToFirestore();
                    },
                    icon: Icon(isEditable ? Icons.save : Icons.edit),
                    label: Text(isEditable ? 'Save' : 'Edit'),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    onPressed: confirmDeleteProfile,
                    icon: const Icon(Icons.delete),
                    label: const Text('Delete Profile'),
                  ),
                ],
              ),
              const SizedBox(height: 30),
              const Row(
                children: [
                  Icon(Icons.upload_file, size: 24),
                  SizedBox(width: 8),
                  Text('Documents', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
              const Divider(height: 20),
              DropdownButton<String>(
                value: selectedDocType,
                onChanged: (val) => setState(() => selectedDocType = val!),
                items: ['ID', 'CV', 'Certificates'].map((doc) {
                  return DropdownMenuItem(
                    value: doc,
                    child: Text(doc),
                  );
                }).toList(),
              ),
              const SizedBox(height: 10),
              isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton.icon(
                onPressed: _uploadDocument,
                icon: const Icon(Icons.upload_file),
                label: const Text('Upload Document'),
              ),
              const SizedBox(height: 10),
              uploadedDocuments.isEmpty
                  ? const Text('No documents uploaded yet.')
                  : SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text('Type')),
                    DataColumn(label: Text('File Name')),
                    DataColumn(label: Text('Action')),
                  ],
                  rows: uploadedDocuments.map((doc) {
                    return DataRow(cells: [
                      DataCell(Text(doc['type'] ?? '')),
                      DataCell(Text(doc['name'] ?? '')),
                      DataCell(
                        IconButton(
                          icon: const Icon(Icons.open_in_new),
                          onPressed: () => _openFile(doc['path'] ?? ''),
                        ),
                      ),
                    ]);
                  }).toList(),
                ),
              ),
              const SizedBox(height: 30),
              Center(
                child: ElevatedButton.icon(
                  onPressed: _navigateToDashboard,
                  icon: const Icon(Icons.arrow_forward),
                  label: const Text('Go to Dashboard'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}












