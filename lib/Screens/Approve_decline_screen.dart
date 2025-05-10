import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ApproveDeclineScreen extends StatefulWidget {
  const ApproveDeclineScreen({super.key});

  @override
  State<ApproveDeclineScreen> createState() => _ApproveDeclineScreenState();
}

class _ApproveDeclineScreenState extends State<ApproveDeclineScreen> {
  List<Map<String, dynamic>> requests = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRequests();
  }

  Future<void> _fetchRequests() async {
    setState(() => isLoading = true);

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("You need to be logged in to view requests.")),
        );
        return;
      }

      final userId = user.uid;  // Automatically get user ID from FirebaseAuth

      // Fetch the requests where 'toUserId' matches the current user's UID
      final querySnapshot = await FirebaseFirestore.instance
          .collection('requests')
          .where('toUserId', isEqualTo: userId)
          .where('status', isEqualTo: 'Pending')  // Only fetch pending ones
          .get();


      if (querySnapshot.docs.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("No requests found.")),
        );
      }

      setState(() {
        requests = querySnapshot.docs.map((doc) {
          final data = doc.data() as Map<String, dynamic>;
          data['id'] = doc.id;
          return data;
        }).toList();
      });
    } catch (e) {
      print('Error fetching requests: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error fetching requests: $e")),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _saveInteractionHistory(String requestId, String status) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    try {
      // Save the interaction history to a separate collection
      await FirebaseFirestore.instance.collection('user_interactions').add({
        'userId': user.uid,
        'requestId': requestId,
        'status': status,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print("Error saving interaction history: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error saving interaction history: $e")),
      );
    }
  }

  void _approveRequest(String requestId) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    // Fetch fullName from 'users' collection
    final userSnapshot = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();

    final fullName = userSnapshot.data()?['fullName'] ?? 'Unknown';

    await FirebaseFirestore.instance
        .collection('requests')
        .doc(requestId)
        .update({
      'status': 'Approved',
      'respondedByPersonnel': fullName,
      'timestamp': FieldValue.serverTimestamp(),
    });

    await _saveInteractionHistory(requestId, 'Approved');

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Request approved.")),
    );
    _fetchRequests();
  }

  void _declineRequest(String requestId) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final userSnapshot = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();

    final fullName = userSnapshot.data()?['fullName'] ?? 'Unknown';

    await FirebaseFirestore.instance
        .collection('requests')
        .doc(requestId)
        .update({
      'status': 'Declined',
      'respondedByPersonnel': fullName,
      'timestamp': FieldValue.serverTimestamp(),
    });

    await _saveInteractionHistory(requestId, 'Declined');

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Request declined.")),
    );
    _fetchRequests();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Approve/Decline Requests")),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
        itemCount: requests.length,
        itemBuilder: (context, index) {
          final request = requests[index];

          return Card(
            margin: const EdgeInsets.all(8),
            child: ListTile(
              title: Text(request['companyName'] ?? 'Unknown Company'),
              subtitle: Text('Bid: ${request['bidNumber']}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.check_circle, color: Colors.green),
                    onPressed: () => _approveRequest(request['id']),
                  ),
                  IconButton(
                    icon: const Icon(Icons.cancel, color: Colors.red),
                    onPressed: () => _declineRequest(request['id']),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
















