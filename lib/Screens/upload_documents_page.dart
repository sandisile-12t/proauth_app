import 'dart:typed_data'; // Import Uint8List
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../widgets/custom_button.dart';

class UploadDocumentsPage extends StatefulWidget {
  const UploadDocumentsPage({super.key});

  @override
  UploadDocumentsPageState createState() => UploadDocumentsPageState(); // Make the state class public
}

class UploadDocumentsPageState extends State<UploadDocumentsPage> { // Remove the underscore
  Uint8List? cvFileBytes;
  Uint8List? idFileBytes;
  Uint8List? certificateFileBytes;
  String? cvFileName;
  String? idFileName;
  String? certificateFileName;

  Future<void> _pickFile(String fileType) async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    );

    if (result == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('File selection canceled.')),
      );
      return; // Exit if no file is selected
    }

    if (result.files.isNotEmpty) {
      setState(() {
        switch (fileType) {
          case 'cv':
            cvFileBytes = result.files.first.bytes;
            cvFileName = result.files.first.name;
            break;
          case 'id':
            idFileBytes = result.files.first.bytes;
            idFileName = result.files.first.name;
            break;
          case 'certificate':
            certificateFileBytes = result.files.first.bytes;
            certificateFileName = result.files.first.name;
            break;
        }
      });
    }
  }

  void _uploadFiles() {
    // Implement upload logic here, using the file bytes and names if necessary
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Documents uploaded successfully!')),
    );
    Navigator.pop(context);
  }

  Widget _buildFileSection(String label, Uint8List? fileBytes, String? fileName, String fileType) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 16)),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Text(fileBytes != null ? fileName! : 'No file selected'),
            ),
            IconButton(
              icon: Icon(Icons.upload_file),
              onPressed: () {
                _pickFile(fileType);
              },
            ),
          ],
        ),
        SizedBox(height: 16),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Upload Documents'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildFileSection('Upload CV', cvFileBytes, cvFileName, 'cv'),
            _buildFileSection('Upload ID Copy', idFileBytes, idFileName, 'id'),
            _buildFileSection('Upload Certificate', certificateFileBytes, certificateFileName, 'certificate'),
            Spacer(),
            CustomButton(
              text: 'Upload Documents',
              onPressed: () {
                _uploadFiles();
              },
              textColor: Colors.green,
            ),
          ],
        ),
      ),
    );
  }
}
