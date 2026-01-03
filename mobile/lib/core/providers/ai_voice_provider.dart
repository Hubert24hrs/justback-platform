import 'dart:async';
import 'package:flutter/foundation.dart';

enum CallStatus {
  disconnected,
  connecting,
  connected,
  ended,
}

enum SpeakingState {
  listening, // User is speaking
  thinking,  // System is processing
  speaking,  // AI is speaking
}

class AIVoiceProvider with ChangeNotifier {
  CallStatus _status = CallStatus.disconnected;
  SpeakingState _speakingState = SpeakingState.listening;
  bool _isMuted = false;
  bool _isSpeakerOn = true;
  Timer? _simulationTimer;

  // Getters
  CallStatus get status => _status;
  SpeakingState get speakingState => _speakingState;
  bool get isMuted => _isMuted;
  bool get isSpeakerOn => _isSpeakerOn;

  // Simulate starting a call
  Future<void> startCall() async {
    _status = CallStatus.connecting;
    notifyListeners();

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));
    
    _status = CallStatus.connected;
    _speakingState = SpeakingState.speaking; // AI greets first
    notifyListeners();

    _startSimulationLoop();
  }

  void endCall() {
    _status = CallStatus.ended;
    _simulationTimer?.cancel();
    notifyListeners();
    
    // Reset after a delay if needed, or handle in UI
    Future.delayed(const Duration(seconds: 2), () {
      _status = CallStatus.disconnected;
      notifyListeners();
    });
  }

  void toggleMute() {
    _isMuted = !_isMuted;
    notifyListeners();
  }

  void toggleSpeaker() {
    _isSpeakerOn = !_isSpeakerOn;
    notifyListeners();
  }

  // Simulate a conversation loop
  void _startSimulationLoop() {
    _simulationTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_status != CallStatus.connected) {
        timer.cancel();
        return;
      }

      // Simple state machine simulation
      switch (_speakingState) {
        case SpeakingState.speaking:
          _speakingState = SpeakingState.listening; // Turn to user
          break;
        case SpeakingState.listening:
          _speakingState = SpeakingState.thinking; // Process
          break;
        case SpeakingState.thinking:
          _speakingState = SpeakingState.speaking; // Respond
          break;
      }
      notifyListeners();
    });
  }
}
