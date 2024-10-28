import 'package:flutter/material.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: ListView(
        children: const [
          ListTile(
            title: Text('Your request for Project X has been approved!'),
            subtitle: Text('Approved on 12 Oct 2024'),
          ),
          ListTile(
            title: Text('You received a request for Project Y'),
            subtitle: Text('Sent on 10 Oct 2024'),
          ),
        ],
      ),
    );
  }
}
