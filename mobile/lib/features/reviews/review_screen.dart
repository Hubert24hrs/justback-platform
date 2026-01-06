import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/review_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';

class ReviewScreen extends StatefulWidget {
  final String bookingId;
  final String propertyId;
  final String propertyName;
  final String? propertyImage;

  const ReviewScreen({
    super.key,
    required this.bookingId,
    required this.propertyId,
    required this.propertyName,
    this.propertyImage,
  });

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> with SingleTickerProviderStateMixin {
  final _commentController = TextEditingController();
  late AnimationController _animationController;
  
  // Rating values (1-5)
  double _overallRating = 0;
  double _cleanlinessRating = 0;
  double _communicationRating = 0;
  double _locationRating = 0;
  double _valueRating = 0;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _commentController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Leave a Review',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: Consumer<ReviewProvider>(
        builder: (context, provider, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Property Card
                _buildPropertyCard(),
                
                const SizedBox(height: 32),
                
                // Overall Rating
                _buildRatingSection(
                  'Overall Experience',
                  'How was your stay?',
                  _overallRating,
                  (value) => setState(() => _overallRating = value),
                  isMain: true,
                ),
                
                const SizedBox(height: 24),
                
                // Category Ratings
                const Text(
                  'Rate specific aspects',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                
                _buildCategoryRating(
                  Icons.cleaning_services_rounded,
                  'Cleanliness',
                  _cleanlinessRating,
                  (v) => setState(() => _cleanlinessRating = v),
                ),
                _buildCategoryRating(
                  Icons.chat_rounded,
                  'Communication',
                  _communicationRating,
                  (v) => setState(() => _communicationRating = v),
                ),
                _buildCategoryRating(
                  Icons.location_on_rounded,
                  'Location',
                  _locationRating,
                  (v) => setState(() => _locationRating = v),
                ),
                _buildCategoryRating(
                  Icons.payments_rounded,
                  'Value for Money',
                  _valueRating,
                  (v) => setState(() => _valueRating = v),
                ),
                
                const SizedBox(height: 32),
                
                // Comment Section
                _buildCommentSection(),
                
                const SizedBox(height: 32),
                
                // Submit Button
                _buildSubmitButton(provider),
                
                const SizedBox(height: 40),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPropertyCard() {
    return GlassBox(
      borderRadius: 16,
      opacity: 0.08,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: widget.propertyImage != null
                  ? Image.network(
                      widget.propertyImage!,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _buildPlaceholderImage(),
                    )
                  : _buildPlaceholderImage(),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.propertyName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Your stay is complete!',
                    style: TextStyle(
                      color: AppConstants.primaryColor.withValues(alpha: 0.8),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Icon(Icons.home_rounded, color: Colors.white38, size: 32),
    );
  }

  Widget _buildRatingSection(
    String title,
    String subtitle,
    double rating,
    ValueChanged<double> onChanged, {
    bool isMain = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          title,
          style: TextStyle(
            color: Colors.white,
            fontSize: isMain ? 20 : 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.6),
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 16),
        _buildStarRating(rating, onChanged, large: isMain),
        if (rating > 0) ...[
          const SizedBox(height: 8),
          Text(
            _getRatingLabel(rating),
            style: TextStyle(
              color: AppConstants.primaryColor,
              fontSize: isMain ? 16 : 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStarRating(double rating, ValueChanged<double> onChanged, {bool large = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        final starValue = index + 1.0;
        final isFilled = rating >= starValue;
        
        return GestureDetector(
          onTap: () => onChanged(starValue),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.symmetric(horizontal: large ? 8 : 4),
            child: Icon(
              isFilled ? Icons.star_rounded : Icons.star_outline_rounded,
              color: isFilled ? AppConstants.primaryColor : Colors.white38,
              size: large ? 48 : 32,
              shadows: isFilled
                  ? [
                      Shadow(
                        color: AppConstants.primaryColor.withValues(alpha: 0.5),
                        blurRadius: 12,
                      ),
                    ]
                  : null,
            ),
          ),
        );
      }),
    );
  }

  Widget _buildCategoryRating(
    IconData icon,
    String label,
    double rating,
    ValueChanged<double> onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassBox(
        borderRadius: 12,
        opacity: 0.05,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Icon(icon, color: AppConstants.primaryColor, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              _buildSmallStarRating(rating, onChanged),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSmallStarRating(double rating, ValueChanged<double> onChanged) {
    return Row(
      children: List.generate(5, (index) {
        final starValue = index + 1.0;
        final isFilled = rating >= starValue;
        
        return GestureDetector(
          onTap: () => onChanged(starValue),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: Icon(
              isFilled ? Icons.star_rounded : Icons.star_outline_rounded,
              color: isFilled ? AppConstants.primaryColor : Colors.white38,
              size: 24,
            ),
          ),
        );
      }),
    );
  }

  Widget _buildCommentSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Share your experience',
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        GlassBox(
          borderRadius: 16,
          opacity: 0.08,
          child: TextField(
            controller: _commentController,
            maxLines: 5,
            maxLength: 500,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Tell others about your experience...',
              hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(16),
              counterStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton(ReviewProvider provider) {
    final isValid = _overallRating > 0 && _commentController.text.trim().length >= 10;
    
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: isValid && !provider.isSubmitting ? _submitReview : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppConstants.primaryColor,
          foregroundColor: Colors.black,
          disabledBackgroundColor: Colors.white.withValues(alpha: 0.1),
          disabledForegroundColor: Colors.white38,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 0,
        ),
        child: provider.isSubmitting
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.black,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.send_rounded, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    isValid ? 'Submit Review' : 'Rate & write a comment',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  String _getRatingLabel(double rating) {
    if (rating >= 5) return 'Excellent!';
    if (rating >= 4) return 'Great';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  }

  Future<void> _submitReview() async {
    final provider = context.read<ReviewProvider>();
    
    final success = await provider.submitReview(
      bookingId: widget.bookingId,
      propertyId: widget.propertyId,
      overallRating: _overallRating,
      comment: _commentController.text.trim(),
      cleanlinessRating: _cleanlinessRating > 0 ? _cleanlinessRating : null,
      communicationRating: _communicationRating > 0 ? _communicationRating : null,
      locationRating: _locationRating > 0 ? _locationRating : null,
      valueRating: _valueRating > 0 ? _valueRating : null,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.white),
              SizedBox(width: 8),
              Text('Thank you for your review!'),
            ],
          ),
          backgroundColor: AppConstants.primaryColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
      Navigator.pop(context, true);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error ?? 'Failed to submit review'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}
