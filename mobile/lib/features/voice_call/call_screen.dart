import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/ai_voice_provider.dart';
import '../../core/constants/app_constants.dart';
import 'dart:math' as math;

class CallScreen extends StatefulWidget {
  const CallScreen({super.key});

  @override
  State<CallScreen> createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
        vsync: this, duration: const Duration(seconds: 2))
      ..repeat(reverse: true);
    
    _waveController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1500))
      ..repeat();

    // Auto-start call on enter
    Future.microtask(() {
      if (mounted) context.read<AIVoiceProvider>().startCall();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _waveController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AIVoiceProvider>(
      builder: (context, provider, child) {
        // Handle Call Ended
        if (provider.status == CallStatus.ended) {
          Future.delayed(const Duration(milliseconds: 500), () {
            if (context.mounted) Navigator.pop(context);
          });
        }

        return Scaffold(
          backgroundColor: const Color(0xFF050510), // Deep Cyber Black
          body: SafeArea(
            child: Column(
              children: [
                // Top Bar
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_downward, color: Colors.white54),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const Text(
                        'SECURE LINE',
                        style: TextStyle(color: AppConstants.primaryColor, letterSpacing: 2, fontSize: 12),
                      ),
                      IconButton(
                        icon: const Icon(Icons.more_vert, color: Colors.white54),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ),

                const Spacer(),

                // Central AI Orb
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Glow
                    AnimatedBuilder(
                      animation: _pulseController,
                      builder: (context, child) {
                        return Container(
                          width: 250 + (_pulseController.value * 20),
                          height: 250 + (_pulseController.value * 20),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _getStateColor(provider.speakingState).withValues(alpha: 0.1),
                            boxShadow: [
                              BoxShadow(
                                color: _getStateColor(provider.speakingState).withValues(alpha: 0.2),
                                blurRadius: 40 + (_pulseController.value * 20),
                                spreadRadius: 10,
                              )
                            ],
                          ),
                        );
                      },
                    ),
                    
                    // Core Orb
                    Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            Colors.white,
                            _getStateColor(provider.speakingState),
                            _getStateColor(provider.speakingState).withValues(alpha: 0.5)
                          ],
                          stops: const [0.1, 0.4, 1.0],
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          _getStateIcon(provider.speakingState),
                          size: 60,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 50),

                // Status Text
                Text(
                  _getStatusText(provider),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  provider.status == CallStatus.connecting ? 'Establishing secure connection...' : '00:04',
                  style: const TextStyle(color: Colors.white54, fontSize: 16),
                ),

                const Spacer(),

                // Waveform Visualization (Mock)
                SizedBox(
                  height: 60,
                  width: double.infinity,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(20, (index) {
                      return AnimatedBuilder(
                        animation: _waveController,
                        builder: (context, child) {
                          final value = math.sin((_waveController.value * 2 * math.pi) + (index * 0.5));
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            width: 3,
                            height: 10 + (value.abs() * 40 * (provider.speakingState == SpeakingState.speaking ? 1 : 0.2)),
                            decoration: BoxDecoration(
                              color: Colors.white38,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          );
                        },
                      );
                    }),
                  ),
                ),

                const Spacer(),

                // Controls
                Container(
                  padding: const EdgeInsets.only(bottom: 50),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Mute
                      _buildControlBtn(
                        icon: provider.isMuted ? Icons.mic_off : Icons.mic,
                        isActive: provider.isMuted,
                        onTap: provider.toggleMute,
                      ),
                      
                      // End Call
                      GestureDetector(
                        onTap: provider.endCall,
                        child: Container(
                          width: 70,
                          height: 70,
                          decoration: BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: Colors.red.withValues(alpha: 0.5), blurRadius: 20, spreadRadius: 5)
                            ],
                          ),
                          child: const Icon(Icons.call_end, color: Colors.white, size: 32),
                        ),
                      ),

                      // Speaker
                      _buildControlBtn(
                        icon: provider.isSpeakerOn ? Icons.volume_up : Icons.volume_off,
                        isActive: provider.isSpeakerOn,
                        onTap: provider.toggleSpeaker,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildControlBtn({required IconData icon, required bool isActive, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.white10,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: isActive ? Colors.black : Colors.white, size: 28),
      ),
    );
  }

  Color _getStateColor(SpeakingState state) {
    switch (state) {
      case SpeakingState.speaking: return AppConstants.primaryColor; // Green (AI)
      case SpeakingState.listening: return Colors.blue;
      case SpeakingState.thinking: return Colors.purple;
    }
  }

  IconData _getStateIcon(SpeakingState state) {
    switch (state) {
      case SpeakingState.speaking: return Icons.graphic_eq;
      case SpeakingState.listening: return Icons.mic;
      case SpeakingState.thinking: return Icons.psychology;
    }
  }

  String _getStatusText(AIVoiceProvider provider) {
    if (provider.status == CallStatus.connecting) return 'Connecting...';
    switch (provider.speakingState) {
      case SpeakingState.speaking: return 'JustBack AI is speaking...';
      case SpeakingState.listening: return 'Listening to you...';
      case SpeakingState.thinking: return 'Thinking...';
    }
  }
}

