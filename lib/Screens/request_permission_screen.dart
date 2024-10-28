import 'package:flutter/material.dart';
import '../widgets/custom_button.dart';

class RequestPermissionPage extends StatelessWidget {
  const RequestPermissionPage({super.key});

  // Controllers for request fields
  static final TextEditingController companyNameController = TextEditingController();
  static final TextEditingController bidNumberController = TextEditingController();
  static final TextEditingController bidDescriptionController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Request Permission'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'Request Permission to Use CV and Qualifications for a Bid',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            TextField(
              controller: companyNameController,
              decoration: InputDecoration(
                labelText: 'Company Name',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: bidNumberController,
              decoration: InputDecoration(
                labelText: 'Bid Number',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: bidDescriptionController,
              decoration: InputDecoration(
                labelText: 'Bid Description',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            SizedBox(height: 16),
            CustomButton(
              text: 'Send Request',
              onPressed: () {
                // TODO: Implement request sending logic
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Permission request sent!')),
                );
                Navigator.pop(context);
              },
              color: Colors.blue,
              textColor: Colors.white, // Add the textColor parameter
            ),
          ],
        ),
      ),
    );
  }
}

