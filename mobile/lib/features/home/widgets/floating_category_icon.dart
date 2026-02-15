import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/property_provider.dart';

class FloatingCategoryIcon extends StatefulWidget {
  final String label;
  final String imagePath;
  final String categoryKey;
  final PropertyProvider provider;
  final int index; // To add deterministic but staggered delay if preferred, or use random

  const FloatingCategoryIcon({
    super.key,
    required this.label,
    required this.imagePath,
    required this.categoryKey,
    required this.provider,
    this.index = 0,
  });

  @override
  State<FloatingCategoryIcon> createState() => _FloatingCategoryIconState();
}

class _FloatingCategoryIconState extends State<FloatingCategoryIcon> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  final _random = math.Random();

  @override
  void initState() {
    super.initState();
    // Random duration between 2.5 and 4 seconds for natural feel
    final duration = Duration(milliseconds: 2500 + _random.nextInt(1500));
    
    _controller = AnimationController(
      vsync: this,
      duration: duration,
    );

    _animation = Tween<double>(begin: -6.0, end: 6.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    // Random start delay to ensure they are not synchronized
    Future.delayed(Duration(milliseconds: _random.nextInt(2000)), () {
      if (mounted) {
        _controller.repeat(reverse: true);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  IconData _getIconForCategory(String key) {
    switch (key) {
      case 'apartment': return Icons.apartment_rounded;
      case 'hotel': return Icons.hotel_rounded;
      case 'shortlet': return Icons.home_work_rounded;
      case 'nightlife': return Icons.nightlife_rounded;
      default: return Icons.home_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSelected = widget.provider.selectedCategory == widget.categoryKey;

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _animation.value),
          child: child,
        );
      },
      child: GestureDetector(
        onTap: () => widget.provider.setCategory(widget.categoryKey),
        child: Column(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: isSelected ? AppConstants.primaryColor.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppConstants.primaryColor : Colors.white.withValues(alpha: 0.1),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isSelected 
                        ? AppConstants.primaryColor.withValues(alpha: 0.4) 
                        : Colors.black.withValues(alpha: 0.5),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                    spreadRadius: isSelected ? 2 : 0,
                  ),
                  if (isSelected)
                    BoxShadow(
                      color: AppConstants.primaryColor.withValues(alpha: 0.2),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: Image.asset(
                  widget.imagePath,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Icon(
                      _getIconForCategory(widget.categoryKey),
                      color: isSelected ? AppConstants.primaryColor : Colors.white70,
                      size: 36,
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              widget.label,
              style: TextStyle(
                color: isSelected ? AppConstants.primaryColor : Colors.white.withValues(alpha: 0.7),
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
