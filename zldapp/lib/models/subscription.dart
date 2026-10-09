class SubscriptionPlan {
  final String id;
  final String name;
  final String? description;
  final String? serviceId;
  final String billingCycle; // weekly, monthly, yearly, permanent
  final double price;
  final double setupFee;
  final int? includedVisits; // null for unlimited
  final int? visitDuration;
  final String priorityLevel;
  final double discountPercentage;
  final double? promotionalPrice;
  final DateTime? promotionValidUntil;
  final int minimumCommitmentMonths;
  final int cancellationNoticeDays;
  final bool autoRenewal;
  final bool isActive;
  final bool isFeatured;
  final int displayOrder;
  final DateTime createdAt;
  final DateTime updatedAt;

  SubscriptionPlan({
    required this.id,
    required this.name,
    this.description,
    this.serviceId,
    required this.billingCycle,
    required this.price,
    this.setupFee = 0,
    this.includedVisits,
    this.visitDuration,
    this.priorityLevel = 'standard',
    this.discountPercentage = 0,
    this.promotionalPrice,
    this.promotionValidUntil,
    this.minimumCommitmentMonths = 0,
    this.cancellationNoticeDays = 30,
    this.autoRenewal = true,
    this.isActive = true,
    this.isFeatured = false,
    this.displayOrder = 0,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      serviceId: json['service_id'],
      billingCycle: json['billing_cycle'],
      price: (json['price'] as num).toDouble(),
      setupFee: (json['setup_fee'] as num?)?.toDouble() ?? 0,
      includedVisits: json['included_visits'],
      visitDuration: json['visit_duration'],
      priorityLevel: json['priority_level'] ?? 'standard',
      discountPercentage: (json['discount_percentage'] as num?)?.toDouble() ?? 0,
      promotionalPrice: (json['promotional_price'] as num?)?.toDouble(),
      promotionValidUntil: json['promotion_valid_until'] != null
          ? DateTime.parse(json['promotion_valid_until'])
          : null,
      minimumCommitmentMonths: json['minimum_commitment_months'] ?? 0,
      cancellationNoticeDays: json['cancellation_notice_days'] ?? 30,
      autoRenewal: json['auto_renewal'] ?? true,
      isActive: json['is_active'] ?? true,
      isFeatured: json['is_featured'] ?? false,
      displayOrder: json['display_order'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'service_id': serviceId,
      'billing_cycle': billingCycle,
      'price': price,
      'setup_fee': setupFee,
      'included_visits': includedVisits,
      'visit_duration': visitDuration,
      'priority_level': priorityLevel,
      'discount_percentage': discountPercentage,
      'promotional_price': promotionalPrice,
      'promotion_valid_until': promotionValidUntil?.toIso8601String(),
      'minimum_commitment_months': minimumCommitmentMonths,
      'cancellation_notice_days': cancellationNoticeDays,
      'auto_renewal': autoRenewal,
      'is_active': isActive,
      'is_featured': isFeatured,
      'display_order': displayOrder,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  String get billingCycleLabel {
    switch (billingCycle) {
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'permanent':
        return 'Permanent';
      default:
        return billingCycle;
    }
  }

  double get effectivePrice {
    if (promotionalPrice != null &&
        promotionValidUntil != null &&
        promotionValidUntil!.isAfter(DateTime.now())) {
      return promotionalPrice!;
    }
    return price;
  }
}

class CustomerSubscription {
  final String id;
  final String customerId;
  final String subscriptionPlanId;
  final String status; // active, paused, cancelled, expired, pending
  final DateTime startDate;
  final DateTime? endDate;
  final DateTime? nextBillingDate;
  final DateTime? lastBillingDate;
  final DateTime? cancelledAt;
  final String? cancelledBy;
  final String? cancellationReason;
  final DateTime? cancellationEffectiveDate;
  final double currentPrice;
  final double discountApplied;
  final int visitsUsed;
  final int? visitsRemaining;
  final String? paymentMethod;
  final String? paymentReference;
  final bool isTrial;
  final DateTime? trialEndDate;
  final String? notes;
  final String? adminNotes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final SubscriptionPlan? subscriptionPlan;
  final Map<String, dynamic>? customer;

  CustomerSubscription({
    required this.id,
    required this.customerId,
    required this.subscriptionPlanId,
    required this.status,
    required this.startDate,
    this.endDate,
    this.nextBillingDate,
    this.lastBillingDate,
    this.cancelledAt,
    this.cancelledBy,
    this.cancellationReason,
    this.cancellationEffectiveDate,
    required this.currentPrice,
    this.discountApplied = 0,
    this.visitsUsed = 0,
    this.visitsRemaining,
    this.paymentMethod,
    this.paymentReference,
    this.isTrial = false,
    this.trialEndDate,
    this.notes,
    this.adminNotes,
    required this.createdAt,
    required this.updatedAt,
    this.subscriptionPlan,
    this.customer,
  });

  factory CustomerSubscription.fromJson(Map<String, dynamic> json) {
    return CustomerSubscription(
      id: json['id'],
      customerId: json['customer_id'],
      subscriptionPlanId: json['subscription_plan_id'],
      status: json['status'],
      startDate: DateTime.parse(json['start_date']),
      endDate: json['end_date'] != null ? DateTime.parse(json['end_date']) : null,
      nextBillingDate: json['next_billing_date'] != null
          ? DateTime.parse(json['next_billing_date'])
          : null,
      lastBillingDate: json['last_billing_date'] != null
          ? DateTime.parse(json['last_billing_date'])
          : null,
      cancelledAt: json['cancelled_at'] != null
          ? DateTime.parse(json['cancelled_at'])
          : null,
      cancelledBy: json['cancelled_by'],
      cancellationReason: json['cancellation_reason'],
      cancellationEffectiveDate: json['cancellation_effective_date'] != null
          ? DateTime.parse(json['cancellation_effective_date'])
          : null,
      currentPrice: (json['current_price'] as num).toDouble(),
      discountApplied: (json['discount_applied'] as num?)?.toDouble() ?? 0,
      visitsUsed: json['visits_used'] ?? 0,
      visitsRemaining: json['visits_remaining'],
      paymentMethod: json['payment_method'],
      paymentReference: json['payment_reference'],
      isTrial: json['is_trial'] ?? false,
      trialEndDate: json['trial_end_date'] != null
          ? DateTime.parse(json['trial_end_date'])
          : null,
      notes: json['notes'],
      adminNotes: json['admin_notes'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      subscriptionPlan: json['subscription_plan'] != null
          ? SubscriptionPlan.fromJson(json['subscription_plan'])
          : null,
      customer: json['customer'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customer_id': customerId,
      'subscription_plan_id': subscriptionPlanId,
      'status': status,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate?.toIso8601String(),
      'next_billing_date': nextBillingDate?.toIso8601String(),
      'last_billing_date': lastBillingDate?.toIso8601String(),
      'cancelled_at': cancelledAt?.toIso8601String(),
      'cancelled_by': cancelledBy,
      'cancellation_reason': cancellationReason,
      'cancellation_effective_date': cancellationEffectiveDate?.toIso8601String(),
      'current_price': currentPrice,
      'discount_applied': discountApplied,
      'visits_used': visitsUsed,
      'visits_remaining': visitsRemaining,
      'payment_method': paymentMethod,
      'payment_reference': paymentReference,
      'is_trial': isTrial,
      'trial_end_date': trialEndDate?.toIso8601String(),
      'notes': notes,
      'admin_notes': adminNotes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  String get statusLabel {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  }

  bool get isActive => status == 'active';
  bool get isPaused => status == 'paused';
  bool get isCancelled => status == 'cancelled';
}

class Contract {
  final String id;
  final String contractNumber;
  final String customerId;
  final String? subscriptionId;
  final String contractType; // subscription, permanent, fixed_term, maintenance
  final String title;
  final String? description;
  final DateTime startDate;
  final DateTime? endDate;
  final DateTime? signedDate;
  final String? signatoryName;
  final String? signatoryTitle;
  final String? witnessName;
  final String? termsAndConditions;
  final String? specialClauses;
  final double? totalValue;
  final String? paymentTerms;
  final String status; // draft, pending_signature, active, completed, terminated, expired
  final String? pdfUrl;
  final String? digitalSignatureUrl;
  final bool autoRenewal;
  final int renewalNoticeDays;
  final String? renewedFromContractId;
  final DateTime? terminatedAt;
  final String? terminationReason;
  final DateTime createdAt;
  final DateTime updatedAt;

  Contract({
    required this.id,
    required this.contractNumber,
    required this.customerId,
    this.subscriptionId,
    required this.contractType,
    required this.title,
    this.description,
    required this.startDate,
    this.endDate,
    this.signedDate,
    this.signatoryName,
    this.signatoryTitle,
    this.witnessName,
    this.termsAndConditions,
    this.specialClauses,
    this.totalValue,
    this.paymentTerms,
    required this.status,
    this.pdfUrl,
    this.digitalSignatureUrl,
    this.autoRenewal = false,
    this.renewalNoticeDays = 30,
    this.renewedFromContractId,
    this.terminatedAt,
    this.terminationReason,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Contract.fromJson(Map<String, dynamic> json) {
    return Contract(
      id: json['id'],
      contractNumber: json['contract_number'],
      customerId: json['customer_id'],
      subscriptionId: json['subscription_id'],
      contractType: json['contract_type'],
      title: json['title'],
      description: json['description'],
      startDate: DateTime.parse(json['start_date']),
      endDate: json['end_date'] != null ? DateTime.parse(json['end_date']) : null,
      signedDate: json['signed_date'] != null ? DateTime.parse(json['signed_date']) : null,
      signatoryName: json['signatory_name'],
      signatoryTitle: json['signatory_title'],
      witnessName: json['witness_name'],
      termsAndConditions: json['terms_and_conditions'],
      specialClauses: json['special_clauses'],
      totalValue: (json['total_value'] as num?)?.toDouble(),
      paymentTerms: json['payment_terms'],
      status: json['status'],
      pdfUrl: json['pdf_url'],
      digitalSignatureUrl: json['digital_signature_url'],
      autoRenewal: json['auto_renewal'] ?? false,
      renewalNoticeDays: json['renewal_notice_days'] ?? 30,
      renewedFromContractId: json['renewed_from_contract_id'],
      terminatedAt: json['terminated_at'] != null
          ? DateTime.parse(json['terminated_at'])
          : null,
      terminationReason: json['termination_reason'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'contract_number': contractNumber,
      'customer_id': customerId,
      'subscription_id': subscriptionId,
      'contract_type': contractType,
      'title': title,
      'description': description,
      'start_date': startDate.toIso8601String().split('T')[0],
      'end_date': endDate?.toIso8601String().split('T')[0],
      'signed_date': signedDate?.toIso8601String().split('T')[0],
      'signatory_name': signatoryName,
      'signatory_title': signatoryTitle,
      'witness_name': witnessName,
      'terms_and_conditions': termsAndConditions,
      'special_clauses': specialClauses,
      'total_value': totalValue,
      'payment_terms': paymentTerms,
      'status': status,
      'pdf_url': pdfUrl,
      'digital_signature_url': digitalSignatureUrl,
      'auto_renewal': autoRenewal,
      'renewal_notice_days': renewalNoticeDays,
      'renewed_from_contract_id': renewedFromContractId,
      'terminated_at': terminatedAt?.toIso8601String(),
      'termination_reason': terminationReason,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
