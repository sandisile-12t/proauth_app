import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../Models/bid_organ_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class PostTenderScreen extends StatefulWidget {
  final BidOrganModel? bidOrganModel;

  const PostTenderScreen({super.key, this.bidOrganModel});

  @override
  _PostTenderScreenState createState() => _PostTenderScreenState();
}

class _PostTenderScreenState extends State<PostTenderScreen> {
  final _bidNumberController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _closingDateController = TextEditingController();
  final List<String> _selectedKeyPersonnel = [];

  final List<String> _availableKeyPersonnel = [
    "Project Manager",
    "Architect",
    "Civil Engineer",
    "Structural Engineer",
    "Electrical Engineer",
    "Mechanical Engineer",
    "Quantity Surveyor",
    "Geotechnical Engineer",
    "Land Surveyor",
    "Environmental Control Officer",
    "Social Facilitator",
  ];

  @override
  void initState() {
    super.initState();
    if (widget.bidOrganModel != null) {
      _bidNumberController.text = widget.bidOrganModel!.bidNumber;
      _descriptionController.text = widget.bidOrganModel!.bidDescription;
      _closingDateController.text = DateFormat('yyyy-MM-dd').format(widget.bidOrganModel!.closingDate);
      _selectedKeyPersonnel.addAll(widget.bidOrganModel!.keyPersonnel);
    }
  }

  Future<void> _selectClosingDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2023),
      lastDate: DateTime(2101),
    );

    if (picked != null) {
      final DateFormat formatter = DateFormat('yyyy-MM-dd');
      setState(() {
        _closingDateController.text = formatter.format(picked);
      });
    }
  }

  void _postTender() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    if (_bidNumberController.text.isEmpty ||
        _descriptionController.text.isEmpty ||
        _selectedKeyPersonnel.isEmpty ||
        _closingDateController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill all fields.")),
      );
      return;
    }

    final DateTime closingDate = DateFormat('yyyy-MM-dd').parse(_closingDateController.text);

    final organDoc = await FirebaseFirestore.instance
        .collection('organs')
        .doc(user.uid)
        .get();

    if (!organDoc.exists) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Organ profile not found.")),
      );
      return;
    }

    final organData = organDoc.data()!;
    final organName = organData['organName'] ?? '';
    final adminType = organData['adminType'] ?? 'organ';

    final baseTenderData = {
      'bidNumber': _bidNumberController.text,
      'bidDescription': _descriptionController.text,
      'keyPersonnel': _selectedKeyPersonnel,
      'closingDate': Timestamp.fromDate(closingDate),
      'postedAt': Timestamp.now(),
      'postedBy': user.uid,
      'adminType': adminType,
      'organName': organName,
    };

    try {
      if (widget.bidOrganModel?.docId != null) {
        // Updating existing tender
        await FirebaseFirestore.instance
            .collection('tenders')
            .doc(widget.bidOrganModel!.docId)
            .update({
          ...baseTenderData,
          'bidId': widget.bidOrganModel!.docId, // Ensure bidId matches docId
        });
      } else {
        // Posting new tender
        final newTenderRef = await FirebaseFirestore.instance
            .collection('tenders')
            .add(baseTenderData);

        // Now update bidId with the Firestore doc ID
        await newTenderRef.update({'bidId': newTenderRef.id});
      }

      _bidNumberController.clear();
      _descriptionController.clear();
      _closingDateController.clear();
      setState(() => _selectedKeyPersonnel.clear());

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(widget.bidOrganModel?.docId != null
              ? "Tender updated."
              : "Tender posted."),
        ),
      );

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  Future<void> _confirmPostTender() async {
    final shouldPost = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Confirm Post"),
        content: const Text("Are you sure you want to post this tender?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Post"),
          ),
        ],
      ),
    );

    if (shouldPost ?? false) {
      _postTender();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.bidOrganModel != null ? "Edit Tender" : "Post Tender")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: _bidNumberController,
                decoration: const InputDecoration(labelText: 'Tender Number'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'Tender Description'),
              ),
              const SizedBox(height: 16),
              const Text(
                'Select Key Personnel: ',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._availableKeyPersonnel.map((person) {
                return CheckboxListTile(
                  title: Text(person),
                  value: _selectedKeyPersonnel.contains(person),
                  onChanged: (bool? value) {
                    setState(() {
                      if (value == true) {
                        _selectedKeyPersonnel.add(person);
                      } else {
                        _selectedKeyPersonnel.remove(person);
                      }
                    });
                  },
                );
              }).toList(),
              const SizedBox(height: 16),
              TextField(
                controller: _closingDateController,
                decoration: const InputDecoration(
                  labelText: 'Closing Date',
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                readOnly: true,
                onTap: () => _selectClosingDate(context),
              ),
              const SizedBox(height: 16),
              Center(
                child: ElevatedButton(
                  onPressed: _confirmPostTender,
                  child: Text(widget.bidOrganModel != null ? "Update Tender" : "Post Tender"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}























































