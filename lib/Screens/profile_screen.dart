import 'package:flutter/material.dart';
import '../widgets/custom_button.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // Controllers for profile fields
  final TextEditingController nameController = TextEditingController(text: 'John Doe');
  final TextEditingController emailController = TextEditingController(text: 'john.doe@example.com');
  // Add more controllers as needed

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profile & Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Profile Information
            TextField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
              enabled: false, // Email is typically not editable
            ),
            SizedBox(height: 16),
            // Add more fields as needed

            // Uploaded Documents Section
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Uploaded Documents',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            ListTile(
              leading: Icon(Icons.description),
              title: Text('CV'),
              trailing: Icon(Icons.check_circle, color: Colors.green),
            ),
            ListTile(
              leading: Icon(Icons.credit_card),
              title: Text('ID Copy'),
              trailing: Icon(Icons.check_circle, color: Colors.green),
            ),
            ListTile(
              leading: Icon(Icons.school),
              title: Text('Certificates'),
              trailing: Icon(Icons.check_circle, color: Colors.green),
            ),
            SizedBox(height: 24),
            CustomButton(
              text: 'Save Changes',
              onPressed: () {
                // TODO: Implement save logic
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Profile updated!')),
                );
              },
              color: Colors.green,
              textColor: Colors.white, // Add the textColor parameter
            ),
          ],
        ),
      ),
    );
  }
}

