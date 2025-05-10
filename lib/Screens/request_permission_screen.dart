import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../Models/bid_organ_model.dart';

class RequestPermissionScreen extends StatefulWidget {
  final BidOrganModel bidOrganModel;
  final String companyId;

  const RequestPermissionScreen({
    super.key,
    required this.bidOrganModel,
    required this.companyId,
  });

  @override
  State<RequestPermissionScreen> createState() => _RequestPermissionScreenState();
}

class _RequestPermissionScreenState extends State<RequestPermissionScreen> {
  String searchQuery = "";
  List<Map<String, dynamic>> searchResults = [];
  Map<String, dynamic>? selectedPersonnel;
  Timer? _debounce;
  bool isLoading = false;

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      searchQuery = value.trim();
      _searchPersonnel(searchQuery);
    });
  }

  Future<void> _searchPersonnel(String query) async {
    if (query.isEmpty) return;

    setState(() => isLoading = true);

    try {
      final results = await FirebaseFirestore.instance
          .collection('users')
          .where('qualification', isGreaterThanOrEqualTo: query)
          .where('qualification', isLessThanOrEqualTo: query + '\uf8ff')
          .get();

      setState(() {
        searchResults = results.docs.map((doc) {
          final data = doc.data() as Map<String, dynamic>;
          data['uid'] = doc.id;
          return data;
        }).toList();
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error fetching personnel: $e")),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }
  Future<void> _sendRequestToSelectedPersonnel() async {
    if (selectedPersonnel == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a personnel first.")),
      );
      return;
    }

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("You need to be logged in to send a request.")),
        );
        return;
      }

      final toUserId = selectedPersonnel?['uid'] ?? 'Unknown UID';

      // Debugging
      print("DEBUG: Sending request to personnel UID = $toUserId");
      print("DEBUG: Logged in company UID = ${user.uid}");

      // Check if request already exists
      final existing = await FirebaseFirestore.instance
          .collection('requests')
          .where('toUserId', isEqualTo: toUserId)
          .where('bidId', isEqualTo: widget.bidOrganModel.id)
          .get();

      if (existing.docs.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Request already sent to this personnel.")),
        );
        return;
      }

      // Fetch company info
      final companySnapshot = await FirebaseFirestore.instance
          .collection('company_users')
          .doc(widget.companyId)
          .get();

      String companyName = 'Unknown Company';

      if (companySnapshot.exists) {
        final companyData = companySnapshot.data();
        companyName = companyData?['companyName'] ?? 'Unnamed Company';
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Company not found (ID: ${widget.companyId})")),
        );
        return;
      }

      final bidId = widget.bidOrganModel.bidId.trim();
      final organName = widget.bidOrganModel.organName;
      final closingDate = widget.bidOrganModel.closingDate;

      // Log values for debugging
      print("DEBUG: Bid ID = $bidId");
      print("DEBUG: Organ Name = $organName");
      print("DEBUG: Selected Personnel = ${selectedPersonnel?['fullName']}");

      if (bidId.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Missing Bid ID – cannot proceed.")),
        );
        return;
      }

      final newDocRef = await FirebaseFirestore.instance.collection('requests').add({
        'initiatedBy': 'company',
        'companyId': widget.companyId,
        'companyName': companyName,
        'bidId': widget.bidOrganModel.id,
        'bidNumber': widget.bidOrganModel.bidNumber,
        'organName': organName,
        'personnelName': selectedPersonnel?['fullName'] ?? 'Unknown',
        'qualification': selectedPersonnel?['qualification'] ?? 'N/A',
        'status': 'Pending',
        'timestamp': FieldValue.serverTimestamp(),
        'toUserId': toUserId,
        'userId': user.uid,
        'bidDescription': widget.bidOrganModel.bidDescription,
        'closingDate': closingDate,
      });

      print("DEBUG: New request created with ID: ${newDocRef.id}");

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Request sent to ${selectedPersonnel!['fullName']}")),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to send request: $e")),
      );
    }
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("Request Permission")),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
          TextField(
          decoration: const InputDecoration(
          labelText: "Search by qualification (e.g. Quantity Surveyor)",
            border: OutlineInputBorder(),
            suffixIcon: Icon(Icons.search),
          ),
          onChanged: _onSearchChanged,
        ),
        const SizedBox(height: 16),
        Expanded(
        child: isLoading
        ? const Center(child: CircularProgressIndicator())
        : searchQuery.isEmpty
    ? const Center(child: Text("Start typing to search..."))
        : ListView.builder(
    itemCount: searchResults.length,
    itemBuilder: (context, index) {
    final personnel
    = searchResults[index];
    return ListTile(
      title: Text(personnel['fullName'] ?? 'No Name'),
      subtitle: Text(personnel['qualification'] ?? 'No Qualification'),
      onTap: () {
        setState(() {
          selectedPersonnel = personnel;
        });
      },
      trailing: selectedPersonnel?['uid'] == personnel['uid']
          ? const Icon(Icons.check_circle, color: Colors.green)
          : null,
    );
    },
        ),
        ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _sendRequestToSelectedPersonnel,
                child: const Text("Send Request"),
              ),
            ],
          ),
        ),
    );
  }
}















