import 'package:flutter/material.dart';

class InteractionHistoryPage extends StatelessWidget {
  const InteractionHistoryPage({super.key});

  // Dummy data for demonstration
  static const List<Map<String, String>> interactions = [
    {
      'company': 'ABC Corp',
      'bid': 'Bid #001',
      'status': 'Accepted',
    },
    {
      'company': 'XYZ Ltd',
      'bid': 'Bid #002',
      'status': 'Declined',
    },
    {
      'date': '2024-10-10',
      'description': 'Meeting with client',
    },
    {
      'date': '2024-10-11',
      'description': 'Follow-up call',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Interaction History'),
      ),
      body: ListView.builder(
        itemCount: interactions.length,
        itemBuilder: (context, index) {
          final interaction = interactions[index];
          // Use the fields based on what you want to display
          if (interaction.containsKey('company')) {
            return ListTile(
              leading: const Icon(Icons.history),
              title: Text('${interaction['company']} - ${interaction['bid']}'),
              subtitle: Text('Status: ${interaction['status']}'),
              trailing: interaction['status'] == 'Accepted'
                  ? const Icon(Icons.check_circle, color: Colors.green)
                  : const Icon(Icons.cancel, color: Colors.red),
            );
          } else if (interaction.containsKey('date')) {
            return ListTile(
              leading: const Icon(Icons.calendar_today),
              title: Text('Date: ${interaction['date']}'),
              subtitle: Text('Description: ${interaction['description']}'),
            );
          } else {
            return const SizedBox(); // Handle any unexpected structure
          }
        },
      ),
    );
  }
}
