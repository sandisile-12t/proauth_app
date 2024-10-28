import 'package:flutter/material.dart';

class ApproveDeclineScreen extends StatelessWidget {
  final String companyName;
  final String bidNumber;
  final String bidDescription;

  const ApproveDeclineScreen({
    Key? key,
    required this.companyName,
    required this.bidNumber,
    required this.bidDescription,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Approve/Decline')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildDetailCard('Company Name:', companyName),
              const SizedBox(height: 16),
              _buildDetailCard('Bid Number:', bidNumber),
              const SizedBox(height: 16),
              _buildDetailCard('Bid Description:', bidDescription),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  // Implement approve action
                },
                child: const Text('Approve'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green, // Use backgroundColor instead of primary
                ),
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () {
                  // Implement decline action
                },
                child: const Text('Decline'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red, // Use backgroundColor instead of primary
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailCard(String title, String value) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(value),
          ],
        ),
      ),
    );
  }
}









