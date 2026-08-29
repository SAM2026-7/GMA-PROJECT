var MockData = {
    members: [
        { id: 'MBR-001', name: 'Grace Okonkwo', email: 'grace@email.com', phone: '08012345678', role: 'member', branch: 'City Complex', status: 'active', joined: '2025-03-15', avatar: null },
        { id: 'MBR-002', name: 'Emmanuel Adeyemi', email: 'emmanuel@email.com', phone: '08098765432', role: 'member', branch: 'City Complex', status: 'active', joined: '2025-06-20', avatar: null },
        { id: 'MBR-003', name: 'Blessing Nwosu', email: 'blessing@email.com', phone: '08155512345', role: 'member', branch: 'City Complex', status: 'active', joined: '2024-11-10', avatar: null },
        { id: 'MBR-004', name: 'Samuel Oladipo', email: 'samuel@email.com', phone: '07033345678', role: 'member', branch: 'City Complex', status: 'inactive', joined: '2025-01-05', avatar: null },
        { id: 'MBR-005', name: 'Deborah Okafor', email: 'deborah@email.com', phone: '09088876543', role: 'member', branch: 'City Complex', status: 'active', joined: '2025-08-01', avatar: null }
    ],

    pastors: [
        { id: 'PST-001', name: 'Pastor James Eze', position: 'Senior Pastor', department: 'Counseling', specialization: 'Marriage & Family', bio: 'Over 15 years of pastoral counseling experience.', status: 'available' },
        { id: 'PST-002', name: 'Pastor Ruth Abiodun', position: 'Associate Pastor', department: 'Prayer', specialization: 'Intercessory Prayer', bio: 'Passionate about leading others into deep prayer and communion with God.', status: 'available' },
        { id: 'PST-003', name: 'Pastor David Chukwuma', position: 'Healing Minister', department: 'Healing', specialization: 'Spiritual & Emotional Healing', bio: 'Dedicated to ministering healing through faith and prayer.', status: 'busy' },
        { id: 'PST-004', name: 'PastorFunke Adekunle', position: 'Youth Pastor', department: 'Counseling', specialization: 'Youth Counseling', bio: 'Working with young people to navigate faith and life challenges.', status: 'available' }
    ],

    bookings: [
        { id: 'GMA-2026-00001', memberId: 'MBR-001', memberName: 'Grace Okonkwo', service: 'Counseling', type: 'Marriage Counseling', date: '2026-09-02', time: '10:00', meetingType: 'Physical', status: 'confirmed', assignedTo: 'Pastor James Eze', reason: 'Pre-marital counseling', createdAt: '2026-08-20T10:30:00' },
        { id: 'GMA-2026-00002', memberId: 'MBR-002', memberName: 'Emmanuel Adeyemi', service: 'Prayer', type: 'Prayer Session', date: '2026-08-28', time: '14:00', meetingType: 'Online', status: 'pending', assignedTo: null, reason: 'Career breakthrough prayer', createdAt: '2026-08-22T15:45:00' },
        { id: 'GMA-2026-00003', memberId: 'MBR-003', memberName: 'Blessing Nwosu', service: 'Healing', type: 'Healing Session', date: '2026-08-25', time: '11:00', meetingType: 'Physical', status: 'completed', assignedTo: 'Pastor David Chukwuma', reason: 'Emotional healing', createdAt: '2026-08-18T09:00:00' },
        { id: 'GMA-2026-00004', memberId: 'MBR-005', memberName: 'Deborah Okafor', service: 'Counseling', type: 'Family Counseling', date: '2026-09-05', time: '15:00', meetingType: 'Phone Call', status: 'confirmed', assignedTo: 'Pastor James Eze', reason: 'Family conflict resolution', createdAt: '2026-08-23T11:20:00' },
        { id: 'GMA-2026-00005', memberId: null, memberName: 'Anonymous Visitor', service: 'Counseling', type: 'Pastoral Consultation', date: '2026-08-30', time: '09:00', meetingType: 'Physical', status: 'new', assignedTo: null, reason: 'Need spiritual guidance', createdAt: '2026-08-25T08:00:00' }
    ],

    prayerRequests: [
        { id: 'PR-00251', memberId: 'MBR-001', memberName: 'Grace Okonkwo', category: 'Family', text: 'Please pray for my family unity and peace in my home.', urgency: 'normal', visibility: 'public', status: 'being_prayed', assignedTeam: 'Prayer Team A', createdAt: '2026-08-20', prayedCount: 27 },
        { id: 'PR-00252', memberId: 'MBR-002', memberName: 'Emmanuel Adeyemi', category: 'Career', text: 'Pray for a breakthrough in my job search. I have been looking for 6 months.', urgency: 'high', visibility: 'public', status: 'received', assignedTeam: null, createdAt: '2026-08-22', prayedCount: 12 },
        { id: 'PR-00253', memberId: 'MBR-003', memberName: 'Blessing Nwosu', category: 'Health', text: 'Pray for my mother who is in the hospital.', urgency: 'urgent', visibility: 'public', status: 'assigned', assignedTeam: 'Prayer Team B', createdAt: '2026-08-24', prayedCount: 35 },
        { id: 'PR-00254', memberId: 'MBR-005', memberName: 'Deborah Okafor', category: 'Spiritual Growth', text: 'Pray for deeper intimacy with God.', urgency: 'normal', visibility: 'private', status: 'being_prayed', assignedTeam: 'Prayer Team A', createdAt: '2026-08-21', prayedCount: 0 },
        { id: 'PR-00255', memberId: null, memberName: 'Anonymous', category: 'Financial', text: 'Please pray for financial breakthrough. I am in debt.', urgency: 'high', visibility: 'public', status: 'follow_up', assignedTeam: 'Prayer Team A', createdAt: '2026-08-19', prayedCount: 41 }
    ],

    counselingCases: [
        { id: 'CASE-001', memberId: 'MBR-001', memberName: 'Grace Okonkwo', type: 'Marriage Counseling', status: 'active', counselor: 'Pastor James Eze', nextSession: '2026-09-02', sessionCount: 3, notes: 'Progressing well. Couple attending regularly.', createdAt: '2026-07-15' },
        { id: 'CASE-002', memberId: 'MBR-003', memberName: 'Blessing Nwosu', type: 'Emotional Healing', status: 'completed', counselor: 'Pastor David Chukwuma', nextSession: null, sessionCount: 5, notes: 'Healing journey completed. Praise God!', createdAt: '2026-06-01' },
        { id: 'CASE-003', memberId: 'MBR-005', memberName: 'Deborah Okafor', type: 'Family Counseling', status: 'active', counselor: 'Pastor James Eze', nextSession: '2026-09-05', sessionCount: 1, notes: 'Initial session completed. Family dynamics assessment ongoing.', createdAt: '2026-08-10' }
    ],

    events: [
        { id: 'EVT-001', title: 'Sunday Worship Service', date: '2026-08-30', time: '10:00 AM', location: 'Main Auditorium', description: 'Join us for an uplifting worship experience.', category: 'service', recurring: true, registrationRequired: false },
        { id: 'EVT-002', title: 'Midweek Bible Study', date: '2026-08-28', time: '5:30 PM', location: 'Main Auditorium', description: 'Deep study into the Word of God.', category: 'service', recurring: true, registrationRequired: false },
        { id: 'EVT-003', title: 'Youth Conference 2026', date: '2026-09-12', time: '9:00 AM', location: 'Main Auditorium', description: 'Annual youth conference themed "Arise and Shine".', category: 'conference', recurring: false, registrationRequired: true },
        { id: 'EVT-004', title: 'Prayer & Healing Night', date: '2026-09-04', time: '6:00 PM', location: 'Main Auditorium', description: 'A special evening dedicated to prayer and healing ministry.', category: 'special', recurring: false, registrationRequired: false },
        { id: 'EVT-005', title: 'Marriage Enrichment Seminar', date: '2026-09-20', time: '10:00 AM', location: 'Conference Hall', description: 'Strengthening marriages through biblical principles.', category: 'seminar', recurring: false, registrationRequired: true },
        { id: 'EVT-006', title: 'Community Outreach', date: '2026-09-27', time: '8:00 AM', location: 'GMA Community Center', description: 'Reaching out to our community with love and support.', category: 'outreach', recurring: false, registrationRequired: true }
    ],

    sermons: [
        { id: 'SER-001', title: 'Walking in Divine Favor', speaker: 'Pastor James Eze', date: '2026-08-24', duration: '45 min', bibleRef: 'Psalm 5:12', category: 'Faith', description: 'Understanding and walking in God\'s favor.', hasAudio: true, hasVideo: true },
        { id: 'SER-002', title: 'The Power of Persistent Prayer', speaker: 'Pastor Ruth Abiodun', date: '2026-08-17', duration: '38 min', bibleRef: 'Luke 18:1-8', category: 'Prayer', description: 'Why we should never give up in prayer.', hasAudio: true, hasVideo: false },
        { id: 'SER-003', title: 'Healing Through Faith', speaker: 'Pastor David Chukwuma', date: '2026-08-10', duration: '42 min', bibleRef: 'James 5:14-16', category: 'Healing', description: 'The biblical foundation for divine healing.', hasAudio: true, hasVideo: true },
        { id: 'SER-004', title: 'Building a Strong Family', speaker: 'Pastor James Eze', date: '2026-08-03', duration: '50 min', bibleRef: 'Joshua 24:15', category: 'Family', description: 'Practical steps to building a godly family.', hasAudio: false, hasVideo: true },
        { id: 'SER-005', title: 'Victory Over Spiritual Warfare', speaker: 'PastorFunke Adekunle', date: '2026-07-27', duration: '40 min', bibleRef: 'Ephesians 6:10-18', category: 'Spiritual Growth', description: 'Understanding and overcoming spiritual warfare.', hasAudio: true, hasVideo: false }
    ],

    testimonies: [
        { id: 'TST-001', name: 'Grace Okonkwo', category: 'Healing', text: 'After months of chronic headaches, I received prayer during the healing service. That night, the pain disappeared completely and has not returned. God is faithful!', approved: true, date: '2026-08-15' },
        { id: 'TST-002', name: 'Emmanuel Adeyemi', category: 'Financial', text: 'I was unemployed for 8 months. The prayer team prayed with me, and within two weeks I received three job offers. God opened doors I never imagined!', approved: true, date: '2026-08-10' },
        { id: 'TST-003', name: 'Blessing Nwosu', category: 'Family', text: 'My marriage was on the brink of collapse. Through counseling at GMA City Complex, we found healing and restoration. We are stronger than ever!', approved: true, date: '2026-08-05' },
        { id: 'TST-004', name: 'Samuel Oladipo', category: 'Salvation', text: 'I came to GMA as a skeptic, but the love of God shown through the members transformed my life. I gave my life to Christ and have never looked back.', approved: true, date: '2026-07-28' },
        { id: 'TST-005', name: 'Deborah Okafor', category: 'Prayer Answered', text: 'I prayed for a complete scholarship to study abroad. Within one month, I received a full scholarship! God answers prayers.', approved: true, date: '2026-07-20' }
    ],

    projects: [
        { id: 'PRJ-001', title: 'Church Building Project', target: 50000000, raised: 32500000, description: 'Building a new worship center to accommodate our growing congregation.', status: 'active', category: 'Building' },
        { id: 'PRJ-002', title: 'Community Outreach Fund', target: 5000000, raised: 3200000, description: 'Supporting community development and charity work.', status: 'active', category: 'Missions' },
        { id: 'PRJ-003', title: 'Youth Development Center', target: 20000000, raised: 8500000, description: 'Creating a space for youth programs, training, and mentorship.', status: 'active', category: 'Youth' }
    ],

    notifications: [
        { id: 'NTF-001', type: 'booking', text: 'Your counseling appointment has been confirmed for September 2, 2026.', time: '2026-08-25T10:00:00', read: false },
        { id: 'NTF-002', type: 'message', text: 'You have received a new message from Pastor James.', time: '2026-08-24T15:30:00', read: false },
        { id: 'NTF-003', type: 'prayer', text: 'Your prayer request has been assigned to Prayer Team A.', time: '2026-08-23T09:15:00', read: true },
        { id: 'NTF-004', type: 'followup', text: 'Your follow-up session is scheduled for tomorrow.', time: '2026-08-22T14:00:00', read: true },
        { id: 'NTF-005', type: 'event', text: 'New church event: Youth Conference 2026 - Register now!', time: '2026-08-20T08:00:00', read: true }
    ],

    chatMessages: [
        { id: 'MSG-001', chatId: 'CHT-001', senderId: 'PST-001', senderName: 'Pastor James Eze', text: 'Hello Grace, how are you doing today?', time: '2026-08-25T10:00:00', read: true },
        { id: 'MSG-002', chatId: 'CHT-001', senderId: 'MBR-001', senderName: 'Grace Okonkwo', text: 'I am doing well, thank you Pastor. Looking forward to our session next week.', time: '2026-08-25T10:05:00', read: true },
        { id: 'MSG-003', chatId: 'CHT-001', senderId: 'PST-001', senderName: 'Pastor James Eze', text: 'That is great to hear. Please continue with the exercises we discussed in our last session.', time: '2026-08-25T10:08:00', read: true },
        { id: 'MSG-004', chatId: 'CHT-002', senderId: 'PST-002', senderName: 'Pastor Ruth Abiodun', text: 'Your prayer request has been received. We are standing with you in prayer.', time: '2026-08-24T09:20:00', read: true },
        { id: 'MSG-005', chatId: 'CHT-002', senderId: 'MBR-002', senderName: 'Emmanuel Adeyemi', text: 'Thank you so much, Pastor. I really appreciate the prayer support.', time: '2026-08-24T09:30:00', read: true }
    ],

    chats: [
        { id: 'CHT-001', participants: ['MBR-001', 'PST-001'], participantNames: ['Grace Okonkwo', 'Pastor James Eze'], caseId: 'CASE-001', lastMessage: 'That is great to hear. Please continue with the exercises...', lastTime: '2026-08-25T10:08:00', unread: 0 },
        { id: 'CHT-002', participants: ['MBR-002', 'PST-002'], participantNames: ['Emmanuel Adeyemi', 'Pastor Ruth Abiodun'], caseId: null, lastMessage: 'Thank you so much, Pastor...', lastTime: '2026-08-24T09:30:00', unread: 1 }
    ],

    givingHistory: [
        { id: 'GIV-001', memberId: 'MBR-001', amount: 25000, category: 'Tithe', method: 'Bank Transfer', reference: 'GMA-T-20260815-001', date: '2026-08-15', status: 'confirmed' },
        { id: 'GIV-002', memberId: 'MBR-001', amount: 10000, category: 'Offering', method: 'Bank Transfer', reference: 'GMA-O-20260820-002', date: '2026-08-20', status: 'confirmed' },
        { id: 'GIV-003', memberId: 'MBR-001', amount: 50000, category: 'Building Project', method: 'Bank Transfer', reference: 'GMA-B-20260810-003', date: '2026-08-10', status: 'confirmed' },
        { id: 'GIV-004', memberId: 'MBR-002', amount: 15000, category: 'Tithe', method: 'Bank Transfer', reference: 'GMA-T-20260818-004', date: '2026-08-18', status: 'confirmed' },
        { id: 'GIV-005', memberId: 'MBR-003', amount: 20000, category: 'Missions', method: 'Bank Transfer', reference: 'GMA-M-20260822-005', date: '2026-08-22', status: 'confirmed' }
    ],

    siteSettings: {
        site_name: 'GMA City Complex',
        hero_description: 'A place of worship, counselling, healing and prayer \u2014 where every soul finds hope and restoration.',
        about_subtitle: 'GMA City Complex is a sanctuary dedicated to nurturing faith and restoring lives.',
        mission_title: 'Our Mission',
        mission_text: 'To reach out with love, strengthen families and walk with every believer on their spiritual journey.',
        vision_title: 'Our Vision',
        vision_text: 'To build a vibrant community where healing, prayer and godly counsel meet real everyday needs.',
        programs_subtitle: 'Choose a program and book a session with us.',
        counselling_description: 'Confidential guidance for marriages, career, family and personal growth.',
        healing_description: 'Spiritual and emotional healing through faith, prayer and the Word.',
        prayer_description: 'Intense times of prayer and intercession for your requests and the city.',
        giving_subtitle: 'Support the work of GMA City Complex through your generous giving.',
        giving_bank: 'Ecobank',
        giving_account: '4331097600',
        contact_phone: '08169761695',
        contact_email: 'info@gmacitycomplex.org',
        contact_address: 'GMA City Complex, Lagos, Nigeria',
        contact_whatsapp: '+2348169761695'
    }
};
