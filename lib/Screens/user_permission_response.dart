import 'package:flutter/material.dart';


class PermissionResponsePage extends StatelessWidget {
  final String companyName;
  final String bidNumber;
  final String bidDescription;

  PermissionResponsePage({
    required this.companyName,
    required this.bidNumber,
    required this.bidDescription,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Permission Request'),
      ),
      body: Center(
        child: Column(
          children: [
            Text('Company: $companyName'),
            Text('Bid Number: $bidNumber'),
            Text('Bid Description: $bidDescription'),
            ElevatedButton(
              onPressed: () {
                // Logic to accept the request
              },
              child: Text('Accept'),
            ),
            ElevatedButton(
              onPressed: () {
                // Logic to decline the request
              },
              child: Text('Decline'),
            ),
          ],
        ),
      ),
    );
  }
}
