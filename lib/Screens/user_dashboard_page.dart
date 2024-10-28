import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_button.dart';

class UserDashboardPage extends StatelessWidget {
  const UserDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Retrieve the AuthProvider instance
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('User Dashboard'),
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () {
              // Call the logout method from AuthProvider
              authProvider.logout();
              Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, // Align text to the start
          children: [
            // Display the user's name from the authProvider
            Text(
              'Welcome, ${authProvider.userName}',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 24),
            CustomButton(
              text: 'Upload Documents',
              onPressed: () {
                Navigator.pushNamed(context, '/uploadDocuments');
              },
              color: Colors.blue, // Specify button background color
              textColor: Colors.white, // Specify text color
            ),
            SizedBox(height: 16),
            CustomButton(
              text: 'View Interaction History',
              onPressed: () {
                Navigator.pushNamed(context, '/interactionHistory');
              },
              color: Colors.blue, // Specify button background color
              textColor: Colors.white, // Specify text color
            ),
            SizedBox(height: 16),
            CustomButton(
              text: 'Profile & Settings',
              onPressed: () {
                Navigator.pushNamed(context, '/profile');
              },
              color: Colors.blue, // Specify button background color
              textColor: Colors.white, // Specify text color
            ),
          ],
        ),
      ),
    );
  }
}


