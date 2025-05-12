import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_analytics/observer.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

import 'Models/Company_user.dart';
import 'Models/organ_model.dart';
import 'Models/bid_organ_model.dart';

import 'Providers/bid_provider.dart';
import 'Providers/organ_of_state_provider.dart';
import 'Providers/company_provider.dart';
import 'Providers/interaction_provider.dart';
import 'Providers/user_provider.dart';
import 'Providers/request_permission_provider.dart';

import 'Screens/company_profile_page.dart';
import 'Screens/signup_organ_of_state.dart';
import 'Screens/login_organof_state.dart';
import 'Screens/dashboard_organ_of_state.dart';
import 'Screens/role_selection_screen.dart';
import 'Screens/login_company_page.dart';
import 'Screens/login_individual.dart';
import 'Screens/signup_company_page.dart';
import 'Screens/signup_individual.dart';
import 'Screens/company_dashboard_page.dart';
import 'Screens/user_dashboard_page.dart';
import 'Screens/interaction_history_page.dart';
import 'Screens/notification_screen.dart';
import 'Screens/profile_screen.dart' as profile;
import 'Screens/forgot_password_page.dart';
import 'Screens/request_permission_screen.dart';
import 'Screens/approve_decline_screen.dart';
import 'Screens/organ_of_state_profile_page.dart';
import 'Screens/view_tender_screen.dart';
import 'Screens/tender_history_screen.dart';
import 'Screens/post_tender_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (kIsWeb) {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: "AIzaSyAk4i3fMMVHcyehmf1Ebq2geVH92Ze6Syg",
        authDomain: "proauth-a5eed.firebaseapp.com",
        projectId: "proauth-a5eed",
        storageBucket: "proauth-a5eed.appspot.com",
        messagingSenderId: "394929459576",
        appId: "1:394929459576:web:e62a92f84d6c18636c388d",
        measurementId: "G-47L1CS3FRF",
      ),
    );
  } else if (!Platform.isWindows) {
    await Firebase.initializeApp();
  }

  final String companyId = const Uuid().v4();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => BidProvider()),
        ChangeNotifierProvider(create: (_) => OrganProvider()),
        ChangeNotifierProvider(create: (_) => CompanyProvider()),
        ChangeNotifierProvider(create: (_) => InteractionProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => RequestPermissionProvider()),
      ],
      child: MyApp(companyId: companyId),
    ),
  );
}

class MyApp extends StatelessWidget {
  final String companyId;

  const MyApp({super.key, required this.companyId});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Professionals Permission App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        textTheme: GoogleFonts.robotoTextTheme(),
      ),
      navigatorObservers: [
        FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance),
      ],
      initialRoute: '/',
      routes: _buildRoutes(),
      onGenerateRoute: (settings) {
        final name = settings.name;
        final args = settings.arguments;

        if (name == '/request_permission') {
          if (args is Map<String, dynamic> &&
              args['tender'] is BidOrganModel &&
              args['companyId'] is String) {
            return MaterialPageRoute(
              builder: (_) => RequestPermissionScreen(
                bidOrganModel: args['tender'],
                companyId: args['companyId'],
              ),
            );
          } else {
            return MaterialPageRoute(
              builder: (_) => const ErrorScreen(
                errorMessage: 'Invalid arguments for request permission',
              ),
            );
          }
        }

        if (name == '/interaction_history') {
          if (args is Map<String, String> &&
              args.containsKey('userId') &&
              args.containsKey('role')) {
            return MaterialPageRoute(
              builder: (_) => InteractionHistoryScreen(
                userId: args['userId']!,
                role: args['role']!,
              ),
            );
          } else {
            return MaterialPageRoute(
              builder: (_) => const ErrorScreen(
                errorMessage: 'Missing or invalid arguments for interaction history',
              ),
            );
          }
        }

        return null; // Let Flutter handle unknown routes via onUnknownRoute
      },
      onUnknownRoute: (_) => MaterialPageRoute(
        builder: (_) => const ErrorScreen(errorMessage: 'Page not found!'),
      ),
    );
  }

  Map<String, WidgetBuilder> _buildRoutes() {
    return {
      '/': (context) => FutureBuilder<Widget>(
        future: initializeUserDataAndRoute(context),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }
          if (snapshot.hasError) {
            return const ErrorScreen(errorMessage: 'Failed to load user data.');
          }
          return snapshot.data ?? const RoleSelectionScreen();
        },
      ),
      '/login/company': (_) => LoginCompanyPage(),
      '/login/individual': (_) => LoginIndividualPage(),
      '/login/organ': (_) => LoginOrganOfState(),
      '/signup/company': (_) => const SignupCompanyPage(),
      '/signup/individual': (_) => SignupIndividualPage(),
      '/signup/organ_of_state': (_) => const SignupOrganPage(),
      '/company_dashboard': (context) {
        final company = ModalRoute.of(context)?.settings.arguments as CompanyUser?;
        if (company == null) {
          return const ErrorScreen(errorMessage: 'Company data is missing.');
        }
        return CompanyDashboardPage(
          companyId: company.id,
          registrationNumber: company.registrationNumber,
        );
      },
      '/user_dashboard': (_) => UserDashboardPage(),
      '/organ_dashboard': (context) {
        final organProvider = Provider.of<OrganProvider>(context, listen: false);
        if (organProvider.currentOrgan != null) {
          return DashboardOrganOfState(organModel: organProvider.currentOrgan!);
        } else {
          return const ErrorScreen(errorMessage: 'Missing organ data.');
        }
      },
      '/profile': (context) => profile.ProfileScreen(
        userInfo: context.read<UserProvider>().currentUser?.toMap() ?? {},
      ),
      '/companyProfile': (context) {
        final company = ModalRoute.of(context)?.settings.arguments as CompanyUser?;
        if (company == null) {
          return const ErrorScreen(errorMessage: 'No company data provided.');
        }
        return CompanyProfilePage(company: company);
      },
      '/organProfile': (context) {
        final organ = ModalRoute.of(context)!.settings.arguments as OrganModel;
        return OrganProfilePage(organModel: organ, role: 'Admin');
      },
      '/interaction_history': (context) {
        final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

        if (args == null || !args.containsKey('userId')) {
          return const ErrorScreen(errorMessage: 'Missing interaction history arguments.');
        }

        return InteractionHistoryScreen(
          userId: args['userId'],
          role: args['role'],
        );
      },

      '/tenderHistory': (_) => const TenderHistoryScreen(),
      '/postTender': (_) => const PostTenderScreen(),
      '/notifications': (context) {
        final String userId = FirebaseAuth.instance.currentUser?.uid ?? ''; // Get userId dynamically
        return NotificationScreen(userId: userId);  // Pass userId to NotificationScreen
      },

      '/forgot_password': (_) => ForgotPasswordPage(),
      '/viewTenders': (context) {
        final args = ModalRoute.of(context)?.settings.arguments as Map<String, String>?;
        return ViewTenderScreen(companyId: args?['companyId'] ?? 'Unknown');
      },
      '/approve_decline': (_) => const ApproveDeclineScreen(),
    };
  }

  Future<Widget> initializeUserDataAndRoute(BuildContext context) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return const RoleSelectionScreen();

    final userDoc = await FirebaseFirestore.instance.collection('users').doc(uid).get();
    final userType = userDoc.data()?['userType'];

    if (userType == 'individual') {
      await Provider.of<UserProvider>(context, listen: false).getUser(uid);
      return UserDashboardPage();
    } else if (userType == 'company') {
      final companyUser = await Provider.of<CompanyProvider>(context, listen: false).getCompanyUser(uid);
      if (companyUser != null) {
        return CompanyDashboardPage(
          companyId: companyUser.id,
          registrationNumber: companyUser.registrationNumber,
        );
      }
    } else if (userType == 'organ') {
      final organ = await Provider.of<OrganProvider>(context, listen: false).getOrganUser(uid);
      if (organ != null) {
        return DashboardOrganOfState(organModel: organ);
      }
    }

    return const RoleSelectionScreen();
  }
}

class ErrorScreen extends StatelessWidget {
  final String errorMessage;
  const ErrorScreen({super.key, required this.errorMessage});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Text(
          errorMessage,
          style: const TextStyle(color: Colors.red, fontSize: 18),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}






