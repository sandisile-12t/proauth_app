import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../Models/bid_organ_model.dart';
import '../Providers/organ_of_state_provider.dart';
import 'post_tender_screen.dart';

class TenderHistoryScreen extends StatelessWidget {
  const TenderHistoryScreen({super.key});

  String formatClosingDate(DateTime value) {
    return "${value.day}/${value.month}/${value.year}";
  }

  Future<void> _deleteTender(BuildContext context, String docId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Confirm Deletion"),
        content: const Text("Are you sure you want to delete this tender?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Delete"),
          ),
        ],
      ),
    );

    if (confirmed ?? false) {
      try {
        await FirebaseFirestore.instance.collection('tenders').doc(docId).delete();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Tender deleted.")),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error deleting tender.")),
        );
      }
    }
  }

  void _editTender(BuildContext context, BidOrganModel bidOrganModel) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PostTenderScreen(bidOrganModel: bidOrganModel),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentOrgan = Provider.of<OrganProvider>(context).currentOrgan;

    if (currentOrgan == null) {
      return const Scaffold(
        body: Center(child: Text("Organ not logged in.")),
      );
    }

    final tendersRef = FirebaseFirestore.instance
        .collection('tenders')
        .where('postedBy', isEqualTo: currentOrgan.id)
        .orderBy('postedAt', descending: true);

    return Scaffold(
      appBar: AppBar(title: const Text("Tender History")),
      body: StreamBuilder<QuerySnapshot>(
        stream: tendersRef.snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }

          final docs = snapshot.data?.docs ?? [];

          if (docs.isEmpty) {
            return const Center(child: Text("No tenders posted yet."));
          }

          return ListView.builder(
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final doc = docs[index];
              final tenderModel = BidOrganModel.fromFirestore(doc);

              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: ListTile(
                  title: Text(tenderModel.bidNumber),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(tenderModel.bidDescription),
                      Text("Closing: ${formatClosingDate(tenderModel.closingDate)}"),
                    ],
                  ),
                  trailing: PopupMenuButton<String>(
                    onSelected: (value) {
                      if (value == 'edit') {
                        _editTender(context, tenderModel);
                      } else if (value == 'delete') {
                        _deleteTender(context, doc.id);
                      }
                    },
                    itemBuilder: (context) => const [
                      PopupMenuItem(value: 'edit', child: Text('Edit')),
                      PopupMenuItem(value: 'delete', child: Text('Delete')),
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











