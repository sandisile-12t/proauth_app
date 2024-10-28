import 'package:flutter/material.dart';
import 'role_selection_screen.dart'; // Adjust import paths if necessary
import 'home_page.dart';
import 'login_individual.dart';
import 'signup_individual.dart';
import 'login_company_page.dart';
import 'signup_company_page.dart';
import 'forgot_password_page.dart';
import 'user_dashboard_page.dart';
import 'company_dashboard_page.dart';
import 'upload_documents_page.dart';
import 'interaction_history_page.dart';
import 'profile_screen.dart';
import 'approve_decline_screen.dart';
import 'notification_screen.dart';
import 'unknown_route_page.dart';

class Routes {
  static const String roleSelection = '/';
  static const String home = '/home';
  static const String loginIndividual = '/loginIndividual';
  static const String signupIndividual = '/signupIndividual';
  static const String loginCompany = '/loginCompany';
  static const String signupCompany = '/signupCompany';
  static const String forgotPassword = '/forgotPassword';
  static const String userDashboard = '/userDashboard';
  static const String companyDashboard = '/companyDashboard';
  static const String uploadDocuments = '/uploadDocuments';
  static const String interactionHistory = '/interactionHistory';
  static const String profile = '/profile';
  static const String approveDecline = '/approveDecline';
  static const String notifications = '/notifications';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case roleSelection:
        return MaterialPageRoute(builder: (_) => const RoleSelectionScreen());
      case home:
        return MaterialPageRoute(builder: (_) => const HomePage());
      case loginIndividual:
        return MaterialPageRoute(builder: (_) => const LoginIndividualPage());
      case signupIndividual:
        return MaterialPageRoute(builder: (_) => const SignUpIndividualPage());
      case loginCompany:
        return MaterialPageRoute(builder: (_) => const LoginCompanyPage());
      case signupCompany:
        return MaterialPageRoute(builder: (_) => const SignUpCompanyPage());
      case forgotPassword:
        return MaterialPageRoute(builder: (_) => const ForgotPasswordPage());
      case userDashboard:
        return MaterialPageRoute(builder: (_) => const UserDashboardPage());
      case companyDashboard:
        return MaterialPageRoute(builder: (_) => const CompanyDashboardPage());
      case uploadDocuments:
        return MaterialPageRoute(builder: (_) => const UploadDocumentsPage());
      case interactionHistory:
        return MaterialPageRoute(builder: (_) => const InteractionHistoryPage());
      case profile:
        return MaterialPageRoute(builder: (_) => const ProfileScreen());
      case approveDecline:
        final args = settings.arguments as Map<String, String>? ?? {};
        return MaterialPageRoute(
          builder: (_) => ApproveDeclineScreen(
            companyName: args['companyName'] ?? 'Default Company',
            bidNumber: args['bidNumber'] ?? 'Default Bid',
            bidDescription: args['bidDescription'] ?? 'Default Description',
          ),
        );
      case notifications:
        return MaterialPageRoute(builder: (_) => const NotificationScreen());
      default:
        return MaterialPageRoute(builder: (_) => const UnknownRoutePage());
    }
  }
}