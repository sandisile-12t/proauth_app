
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class NotificationScreen extends StatelessWidget {
  final String userId; // ID of the logged-in individual (key personnel)

  const NotificationScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Notifications")),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('requests')
            .where('toUserId', isEqualTo: userId)
            .orderBy('requestedAt', descending: true)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return const Center(child: Text("No new permission requests."));
          }

          final requests = snapshot.data!.docs;

          return ListView.builder(
            itemCount: requests.length,
            itemBuilder: (context, index) {
              final request = requests[index];
              final companyName = request['fromCompanyName'] ?? 'Unknown Company';
              final bidNumber = request['bidNumber'] ?? 'N/A';
              final status = request['status'] ?? 'pending';
              final requestedAt = request['requestedAt'] != null
                  ? (request['requestedAt'] as Timestamp).toDate()
                  : null;

              return ListTile(
                leading: const Icon(Icons.mark_email_unread, color: Colors.blue),
                title: Text("$companyName wants to use your document for Bid $bidNumber"),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Status: ${status[0].toUpperCase()}${status.substring(1)}"),
                    if (requestedAt != null)
                      Text("Requested on: ${requestedAt.toLocal().toString().split('.').first}"),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

