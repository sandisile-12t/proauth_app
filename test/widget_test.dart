
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:proauth/main.dart'; // Ensure the path is correct

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build the app and trigger a frame.
    await tester.pumpWidget(const ProAuthApp());

    // Assuming you have some initial state in your HomePage
    expect(find.text('0'), findsOneWidget); // Adjust based on your initial state
    expect(find.text('1'), findsNothing);

    // Tap the '+' icon and trigger a frame.
    await tester.tap(find.byIcon(Icons.add)); // Ensure this icon exists
    await tester.pump();

    // Verify that the counter has incremented.
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget); // Adjust based on your expected behavior
  });
}

