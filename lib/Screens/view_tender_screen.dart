import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:proauth/Screens/request_permission_screen.dart';
import '../Models/bid_organ_model.dart';

class ViewTenderScreen extends StatelessWidget {
  final String companyId;

  const ViewTenderScreen({super.key, required this.companyId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Available Tenders")),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('tenders')
            .where('postedBy', isNotEqualTo: null)
            .orderBy('postedAt', descending: true)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return const Center(child: Text("No tenders available"));
          }

          final tenders = snapshot.data!.docs.map((doc) {
            return BidOrganModel.fromFirestore(doc);
          }).toList();

          return ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: tenders.length,
            itemBuilder: (context, index) {
              final tender = tenders[index];

              return Card(
                elevation: 4,
                margin: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  title: Text(
                    tender.bidNumber,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Bid ID: ${tender.bidId}",
                        style: const TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Closing Date: ${tender.closingDate}",
                        style: const TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 8),
                      if (tender.keyPersonnel.isNotEmpty) ...[
                        const Text(
                          "Key Personnel:",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        ...tender.keyPersonnel.map(
                              (person) => Text("• $person"),
                        ),
                        const SizedBox(height: 8),
                      ],
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => RequestPermissionScreen(
                                bidOrganModel: tender,
                                companyId: companyId,
                              ),
                            ),
                          );
                        },
                        child: const Text("Request Permission"),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}














