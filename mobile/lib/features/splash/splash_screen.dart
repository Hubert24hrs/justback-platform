import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/constants/app_constants.dart';
import 'dart:async';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
       duration: const Duration(seconds: 2),
       vsync: this,
    )..repeat(reverse: true);
    
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
     _fadeAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _checkAuthAndNavigate();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _checkAuthAndNavigate() async {
    // Artificial delay to show off the cool animation
    await Future.delayed(const Duration(seconds: 3));
    
    if (!mounted) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.checkAuthStatus();

    if (!mounted) return;

    if (authProvider.isLoggedIn) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C), // Deepest dark
      body: Stack(
        children: [
          // Background Glow
          Center(
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppConstants.primaryColor.withOpacity(0.05),
                boxShadow: [
                  BoxShadow(
                    color: AppConstants.primaryColor.withOpacity(0.1),
                    blurRadius: 100,
                    spreadRadius: 50,
                  ),
                ],
              ),
            ),
          ),
          
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Pulsing Logo
                AnimatedBuilder(
                  animation: _controller,
                  builder: (context, child) {
                     return Transform.scale(
                       scale: _scaleAnimation.value,
                       child: Container(
                         padding: const EdgeInsets.all(24),
                         decoration: BoxDecoration(
                           color: Colors.transparent,
                           shape: BoxShape.circle,
                           border: Border.all(
                             color: AppConstants.primaryColor.withOpacity(_fadeAnimation.value),
                             width: 2,
                           ),
                           boxShadow: [
                             BoxShadow(
                               color: AppConstants.primaryColor.withOpacity(0.3 * _fadeAnimation.value),
                               blurRadius: 30,
                               spreadRadius: 5,
                             )
                           ],
                         ),
                         child: const Icon(
                           Icons.night_shelter_rounded, // Assuming new logo
                           size: 60,
                           color: AppConstants.primaryColor,
                         ),
                       ),
                     );
                  },
                ),
                
                const SizedBox(height: 48),
                
                // Text
                RichText(
                  text: const TextSpan(
                    style: TextStyle(fontSize: 40, fontWeight: FontWeight.w900, fontFamily: 'Courier', letterSpacing: -1),
                    children: [
                      TextSpan(text: 'Just', style: TextStyle(color: Colors.white)),
                      TextSpan(text: 'Back', style: TextStyle(color: AppConstants.primaryColor)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'FUTURE OF HOSPITALITY',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white54,
                    letterSpacing: 4,
                  ),
                ),
                
                const SizedBox(height: 60),
                
                // Loader
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppConstants.primaryColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
