import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_constants.dart';
import 'core/providers/auth_provider.dart';
import 'core/services/api_client.dart';
import 'features/splash/splash_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/home/home_screen.dart';
import 'features/properties/property_details_screen.dart';
import 'features/bookings/booking_summary_screen.dart';
import 'features/bookings/booking_success_screen.dart';
import 'features/bookings/my_bookings_screen.dart';
import 'features/host/host_dashboard_screen.dart';
import 'features/host/add_property_screen.dart';
import 'features/chat/chat_list_screen.dart';
import 'features/chat/chat_detail_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/wallet/wallet_screen.dart';
import 'core/providers/property_provider.dart';
import 'core/providers/booking_provider.dart';
import 'core/providers/host_provider.dart';
import 'core/providers/chat_provider.dart';

void main() {
  runApp(const JustBackApp());
}

class JustBackApp extends StatelessWidget {
  const JustBackApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PropertyProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => HostProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        Provider(create: (_) => ApiClient()),
      ],
      child: MaterialApp(
        title: AppConstants.appName,
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.green,
          primaryColor: AppConstants.primaryColor,
          scaffoldBackgroundColor: Colors.white,
          fontFamily: 'Outfit',
          appBarTheme: const AppBarTheme(
            elevation: 0,
            backgroundColor: Colors.white,
            iconTheme: IconThemeData(color: Colors.black),
            titleTextStyle: TextStyle(
              color: Colors.black,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        home: const SplashScreen(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const HomeScreen(),
          '/my-bookings': (context) => const MyBookingsScreen(),
          '/booking-success': (context) => const BookingSuccessScreen(),
          '/host-dashboard': (context) => const HostDashboardScreen(),
          '/add-property': (context) => const AddPropertyScreen(),
          '/chat-list': (context) => const ChatListScreen(),
          '/profile': (context) => const ProfileScreen(),
          '/wallet': (context) => const WalletScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name == '/property-details') {
            final propertyId = settings.arguments as String;
            return MaterialPageRoute(
              builder: (context) => PropertyDetailsScreen(propertyId: propertyId),
            );
          }
          if (settings.name == '/booking-summary') {
            final property = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => BookingSummaryScreen(property: property),
            );
          }
          if (settings.name == '/chat-detail') {
            final conversation = settings.arguments as Map<String, dynamic>;
            return MaterialPageRoute(
              builder: (context) => ChatDetailScreen(conversation: conversation),
            );
          }
          return null;
        },
      ),
    );
  }
}
