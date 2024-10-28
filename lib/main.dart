import 'package:flutter/material.dart';
import 'routes.dart'; // Import your routes file

void main() {
  runApp(const ProAuthApp());
}

class ProAuthApp extends StatelessWidget {
  const ProAuthApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ProAuth App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: Routes.roleSelection,
      onGenerateRoute: Routes.generateRoute,
      onUnknownRoute: (settings) => MaterialPageRoute(
        builder: (context) => const UnknownRoutePage(),
      ),
    );
  }
}
class ExampleScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Example')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, Routes.signupCompany);
              },
              child: const Text('Go to Signup Company'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, Routes.loginCompany);
              },
              child: const Text('Sign in as Company'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, Routes.loginIndividual);
              },
              child: const Text('Sign in as Individual'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, Routes.signupIndividual);
              },
              child: const Text('Go to Individual Signup'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(
                  context,
                  Routes.approveDecline,
                  arguments: {
                    'companyName': 'ABC Construction',
                    'bidNumber': 'BID12345',
                    'bidDescription': 'Bid for construction of a new bridge.',
                  },
                );
              },
              child: const Text('Go to Approve/Decline Screen'),
            ),
          ],
        ),
      ),
    );
  }
}







