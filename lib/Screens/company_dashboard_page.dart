import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_button.dart';

class CompanyDashboardPage extends StatelessWidget {
  const CompanyDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    // Remove the line that accesses companyName
    final welcomeMessage = 'Welcome, ${authProvider.userName}'; // Change to userName or any other relevant information

    return Scaffold(
      appBar: AppBar(
        title: const Text('Company Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              authProvider.logout();
              Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              welcomeMessage, // Use the updated message
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Request Permission',
              onPressed: () {
                Navigator.pushNamed(context, '/requestPermission');
              },
              textColor: Colors.white,
            ),
            const SizedBox(height: 16),
            CustomButton(
              text: 'View Interaction History',
              onPressed: () {
                Navigator.pushNamed(context, '/interactionHistory');
              },
              textColor: Colors.white,
            ),
          ],
        ),
      ),
    );
  }
}





