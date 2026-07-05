'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';

const APP_URL = 'https://app.syntheonhub.com';

export default function LegalPage() {
  const [active, setActive] = useState('privacy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hash = window.location.hash.replace('#', '');
    if (hash) setActive(hash);
  }, []);

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'cookies', label: 'Cookie Policy' },
    { id: 'consent', label: 'Consent & DPDP' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'dpa', label: 'DPA' },
    { id: 'refund', label: 'Refund Policy' },
  ];

  const s = () => ({
    h1: {
      fontFamily: "'Space Grotesk', sans-serif" as const,
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#fff',
      marginBottom: '0.5rem',
      marginTop: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: "'Space Grotesk', sans-serif" as const,
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.85)',
      marginBottom: '0.5rem',
      marginTop: '2rem',
      letterSpacing: '-0.01em',
    },
    p: {
      fontSize: '15px',
      color: 'rgba(255,255,255,0.5)',
      lineHeight: 1.8,
      marginBottom: '1rem',
    },
    li: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.5)',
      lineHeight: 1.8,
      marginBottom: '0.4rem',
    },
  });

  const Privacy = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: July 7, 2026
      </p>

      <h2 style={s().h1}>Privacy Policy</h2>
      <p style={s().p}>
        This Privacy Notice for <strong>BHUVAN G S</strong> (doing business as{' '}
        <strong>Syntheon Hub</strong>) (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
        describes how and why we might access, collect, store, use, and/or share
        (&ldquo;process&rdquo;) your personal information when you use our services
        (&ldquo;Services&rdquo;), including when you:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Visit our website at www.syntheonhub.com or any website of ours that links to this Privacy Notice',
          'Use Syntheon Hub — an AI-powered project management platform that helps teams manage projects, meetings, tasks, tickets, sprints, and milestones. The platform uses artificial intelligence to analyze meeting transcripts and user-provided content to generate actionable project artifacts, improve planning, and enhance team collaboration.',
          'Engage with us in other related ways, including any marketing or events',
        ].map((c, i) => (
          <li key={i} style={s().li}>{c}</li>
        ))}
      </ul>
      <p style={s().p}>
        <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand
        your privacy rights and choices. We are responsible for making decisions about how your
        personal information is processed. If you do not agree with our policies and practices,
        please do not use our Services. If you still have any questions or concerns, please contact
        us at{' '}
        <a href="mailto:privacy@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          privacy@syntheonhub.com
        </a>
        .
      </p>

      <h2 style={s().h2}>Summary of Key Points</h2>
      <p style={s().p}>
        This summary provides key points from our Privacy Notice, but you can find out more details
        about any of these topics by clicking the link following each key point or by using our table
        of contents below to find the section you are looking for.
      </p>
      <p style={s().p}>
        <strong>What personal information do we process?</strong> When you visit, use, or navigate
        our Services, we may process personal information depending on how you interact with us and
        the Services, the choices you make, and the products and features you use.
      </p>
      <p style={s().p}>
        <strong>Do we process any sensitive personal information?</strong> Some of the information
        may be considered &ldquo;special&rdquo; or &ldquo;sensitive&rdquo; in certain jurisdictions,
        for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do
        not process sensitive personal information.
      </p>
      <p style={s().p}>
        <strong>Do we collect any information from third parties?</strong> We do not collect any
        information from third parties.
      </p>
      <p style={s().p}>
        <strong>How do we process your information?</strong> We process your information to provide,
        improve, and administer our Services, communicate with you, for security and fraud
        prevention, and to comply with law. We may also process your information for other purposes
        with your consent. We process your information only when we have a valid legal reason to do
        so.
      </p>
      <p style={s().p}>
        <strong>In what situations and with which parties do we share personal information?</strong>{' '}
        We may share information in specific situations and with specific third parties.
      </p>
      <p style={s().p}>
        <strong>How do we keep your information safe?</strong> We have adequate organizational and
        technical processes and procedures in place to protect your personal information. However,
        no electronic transmission over the internet or information storage technology can be
        guaranteed to be 100% secure.
      </p>
      <p style={s().p}>
        <strong>What are your rights?</strong> Depending on where you are located geographically,
        the applicable privacy law may mean you have certain rights regarding your personal
        information.
      </p>
      <p style={s().p}>
        <strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is
        by visiting{' '}
        <a href="https://www.syntheonhub.com/settings" style={{ color: 'rgba(255,255,255,0.5)' }}>
          www.syntheonhub.com/settings
        </a>
        , or by contacting us. We will consider and act upon any request in accordance with
        applicable data protection laws.
      </p>

      <h2 style={s().h2}>Table of Contents</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'What information do we collect?',
          'How do we process your information?',
          'When and with whom do we share your personal information?',
          'Do we use cookies and other tracking technologies?',
          'Do we offer artificial intelligence-based products?',
          'How do we handle your social logins?',
          'How long do we keep your information?',
          'How do we keep your information safe?',
          'Do we collect information from minors?',
          'What are your privacy rights?',
          'Controls for Do-Not-Track features',
          'Meeting recording consent',
          'Do we make updates to this notice?',
          'How can you contact us about this notice?',
          'How can you review, update, or delete the data we collect from you?',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {i + 1}. {c}
          </li>
        ))}
      </ul>

      <h2 style={s().h1}>1. What Information Do We Collect?</h2>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Personal information you disclose to us</h3>
      <p style={s().p}>
        <strong>In Short:</strong> We collect personal information that you provide to us.
      </p>
      <p style={s().p}>
        We collect personal information that you voluntarily provide to us when you register on the
        Services, express an interest in obtaining information about us or our products and Services,
        when you participate in activities on the Services, or otherwise when you contact us.
      </p>
      <p style={s().p}>
        <strong>Personal Information Provided by You.</strong> The personal information that we
        collect depends on the context of your interactions with us and the Services, the choices
        you make, and the products and features you use. The personal information we collect may
        include the following:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {['Names', 'Email addresses', 'Usernames', 'Contact or authentication data', 'User-generated content'].map((c, i) => (
          <li key={i} style={s().li}>{c}</li>
        ))}
      </ul>
      <p style={s().p}>
        <strong>Sensitive Information.</strong> We do not process sensitive information.
      </p>
      <p style={s().p}>
        <strong>Payment Data.</strong> We may collect data necessary to process your payment if you
        choose to make purchases, such as your payment instrument number, and the security code
        associated with your payment instrument. All payment data is handled and stored by Stripe.
        You may find their privacy notice{' '}
        <a href="https://stripe.com/in/privacy" style={{ color: 'rgba(255,255,255,0.5)' }}>
          here
        </a>
        .
      </p>
      <p style={s().p}>
        <strong>Social Media Login Data.</strong> We may provide you with the option to register
        with us using your existing social media account details, like your Facebook, X, or other
        social media account. If you choose to register in this way, we will collect certain profile
        information about you from the social media provider, as described in the section called
        &ldquo;How do we handle your social logins?&rdquo; below.
      </p>
      <p style={s().p}>
        All personal information that you provide to us must be true, complete, and accurate, and
        you must notify us of any changes to such personal information.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Google API</h3>
      <p style={s().p}>
        Our use of information received from Google APIs will adhere to{' '}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Google API Services User Data Policy
        </a>
        , including the{' '}
        <a href="https://developers.google.com/terms/api-services-user-data-policy#limited-use" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Limited Use requirements
        </a>
        .
      </p>

      <h2 style={s().h1}>2. How Do We Process Your Information?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We process your information to provide, improve, and administer
        our Services, communicate with you, for security and fraud prevention, and to comply with
        law. We may also process your information for other purposes with your consent.
      </p>
      <p style={s().p}>
        We process your personal information for a variety of reasons, depending on how you interact
        with our Services, including:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'To facilitate account creation and authentication and otherwise manage user accounts. We may process your information so you can create and log in to your account, as well as keep your account in working order.',
          'To deliver and facilitate delivery of services to the user. We may process your information to provide you with the requested service.',
          'To send administrative information to you. We may process your information to send you details about our products and services, changes to our terms and policies, and other similar information.',
          'To enable user-to-user communications. We may process your information if you choose to use any of our offerings that allow for communication with another user.',
          'To protect our Services. We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.',
          'To evaluate and improve our Services, products, marketing, and your experience. We may process your information when we believe it is necessary to identify usage trends, determine the effectiveness of our promotional campaigns, and to evaluate and improve our Services, products, marketing, and your experience.',
          'To identify usage trends. We may process information about how you use our Services to better understand how they are being used so we can improve them.',
          'To comply with our legal obligations. We may process your information to comply with our legal obligations, respond to legal requests, and exercise, establish, or defend our legal rights.',
        ].map((c, i) => (
          <li key={i} style={s().li}>{c}</li>
        ))}
      </ul>

      <h2 style={s().h1}>3. When and With Whom Do We Share Your Personal Information?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We may share information in specific situations described in this
        section and/or with the following third parties.
      </p>
      <p style={s().p}>
        <strong>Vendors, Consultants, and Other Third-Party Service Providers.</strong> We may share
        your data with third-party vendors, service providers, contractors, or agents
        (&ldquo;third parties&rdquo;) who perform services for us or on our behalf and require
        access to such information to do that work. We have contracts in place with our third
        parties, which are designed to help safeguard your personal information. This means that
        they cannot do anything with your personal information unless we have instructed them to do
        it. They will also not share your personal information with any organization apart from us.
        They also commit to protect the data they hold on our behalf and to retain it for the period
        we instruct.
      </p>
      <p style={s().p}>The third parties we may share personal information with are as follows:</p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Cloud Computing Services: Amazon Web Services (AWS)',
          'Invoice and Billing: Stripe',
          'AI Platforms: Groq',
          'AI Platforms: Deepgram',
          'User Account Registration & Authentication: Clerk',
        ].map((c, i) => (
          <li key={i} style={s().li}>{c}</li>
        ))}
      </ul>
      <p style={s().p}>
        We also may need to share your personal information in the following situations:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.',
        ].map((c, i) => (
          <li key={i} style={s().li}>{c}</li>
        ))}
      </ul>

      <h2 style={s().h1}>4. Do We Use Cookies and Other Tracking Technologies?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We may use cookies and other tracking technologies to collect
        and store your information.
      </p>
      <p style={s().p}>
        We may use cookies and similar tracking technologies (like web beacons and pixels) to gather
        information when you interact with our Services. Some online tracking technologies help us
        maintain the security of our Services and your account, prevent crashes, fix bugs, save your
        preferences, and assist with basic site functions.
      </p>
      <p style={s().p}>
        Specific information about how we use such technologies and how you can refuse certain
        cookies is set out in our{' '}
        <a href="/cookie-policy" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Cookie Notice
        </a>
        .
      </p>

      <h2 style={s().h1}>5. Do We Offer Artificial Intelligence-Based Products?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We offer products, features, or tools powered by artificial
        intelligence, machine learning, or similar technologies.
      </p>
      <p style={s().p}>
        As part of our Services, we offer products, features, or tools powered by artificial
        intelligence, machine learning, or similar technologies (collectively, &ldquo;AI
        Products&rdquo;). These tools are designed to enhance your experience and provide you with
        innovative solutions. The terms in this Privacy Notice govern your use of the AI Products
        within our Services.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Use of AI Technologies</h3>
      <p style={s().p}>
        We provide the AI Products through third-party service providers (&ldquo;AI Service
        Providers&rdquo;), including <strong>Groq</strong> and <strong>Deepgram</strong>. As
        outlined in this Privacy Notice, your input, output, and personal information will be shared
        with and processed by these AI Service Providers to enable your use of our AI Products. You
        must not use the AI Products in any way that violates the terms or policies of any AI
        Service Provider.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Our AI Products</h3>
      <p style={s().p}>Our AI Products are designed for the following functions:</p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {['Natural language processing', 'AI document generation', 'AI insights'].map((c, i) => (
          <li key={i} style={s().li}>{c}</li>
        ))}
      </ul>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>How We Process Your Data Using AI</h3>
      <p style={s().p}>
        All personal information processed using our AI Products is handled in line with our Privacy
        Notice and our agreement with third parties. This ensures high security and safeguards your
        personal information throughout the process, giving you peace of mind about your data's
        safety.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>How to Opt Out</h3>
      <p style={s().p}>
        We believe in giving you the power to decide how your data is used. To opt out, you can:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {['Log in to your account settings and update your user account'].map((c, i) => (
          <li key={i} style={s().li}>{c}</li>
        ))}
      </ul>

      <h2 style={s().h1}>6. How Do We Handle Your Social Logins?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> If you choose to register or log in to our Services using a
        social media account, we may have access to certain information about you.
      </p>
      <p style={s().p}>
        Our Services offer you the ability to register and log in using your third-party social
        media account details (like your Facebook or X logins). Where you choose to do this, we will
        receive certain profile information about you from your social media provider. The profile
        information we receive may vary depending on the social media provider concerned, but will
        often include your name, email address, friends list, and profile picture, as well as other
        information you choose to make public on such a social media platform.
      </p>
      <p style={s().p}>
        We will use the information we receive only for the purposes that are described in this
        Privacy Notice or that are otherwise made clear to you on the relevant Services. Please note
        that we do not control, and are not responsible for, other uses of your personal information
        by your third-party social media provider. We recommend that you review their privacy notice
        to understand how they collect, use, and share your personal information, and how you can
        set your privacy preferences on their sites and apps.
      </p>

      <h2 style={s().h1}>7. How Long Do We Keep Your Information?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We keep your information for as long as necessary to fulfill the
        purposes outlined in this Privacy Notice unless otherwise required by law.
      </p>
      <p style={s().p}>
        We will only keep your personal information for as long as it is necessary for the purposes
        set out in this Privacy Notice, unless a longer retention period is required or permitted by
        law (such as tax, accounting, or other legal requirements). No purpose in this notice will
        require us keeping your personal information for longer than the period of time in which
        users have an account with us.
      </p>
      <p style={s().p}>
        When we have no ongoing legitimate business need to process your personal information, we
        will either delete or anonymize such information, or, if this is not possible (for example,
        because your personal information has been stored in backup archives), then we will securely
        store your personal information and isolate it from any further processing until deletion is
        possible.
      </p>

      <h2 style={s().h1}>8. How Do We Keep Your Information Safe?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We aim to protect your personal information through a system of
        organizational and technical security measures.
      </p>
      <p style={s().p}>
        We have implemented appropriate and reasonable technical and organizational security
        measures designed to protect the security of any personal information we process. However,
        despite our safeguards and efforts to secure your information, no electronic transmission
        over the Internet or information storage technology can be guaranteed to be 100% secure, so
        we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third
        parties will not be able to defeat our security and improperly collect, access, steal, or
        modify your information. Although we will do our best to protect your personal information,
        transmission of personal information to and from our Services is at your own risk. You should
        only access the Services within a secure environment.
      </p>

      <h2 style={s().h1}>9. Do We Collect Information From Minors?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We do not knowingly collect data from or market to children under
        18 years of age.
      </p>
      <p style={s().p}>
        We do not knowingly collect, solicit data from, or market to children under 18 years of age,
        nor do we knowingly sell such personal information. By using the Services, you represent that
        you are at least 18 or that you are the parent or guardian of such a minor and consent to
        such minor dependent&rsquo;s use of the Services. If we learn that personal information from
        users less than 18 years of age has been collected, we will deactivate the account and take
        reasonable measures to promptly delete such data from our records. If you become aware of
        any data we may have collected from children under age 18, please contact us at{' '}
        <a href="mailto:privacy@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          privacy@syntheonhub.com
        </a>
        .
      </p>

      <h2 style={s().h1}>10. What Are Your Privacy Rights?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> You may review, change, or terminate your account at any time,
        depending on your country, province, or state of residence.
      </p>
      <p style={s().p}>
        <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your
        personal information, which may be express and/or implied consent depending on the
        applicable law, you have the right to withdraw your consent at any time. You can withdraw
        your consent at any time by contacting us using the contact details provided in the section
        &ldquo;How can you contact us about this notice?&rdquo; below.
      </p>
      <p style={s().p}>
        However, please note that this will not affect the lawfulness of the processing before its
        withdrawal nor, when applicable law allows, will it affect the processing of your personal
        information conducted in reliance on lawful processing grounds other than consent.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Account Information</h3>
      <p style={s().p}>
        If you would at any time like to review or change the information in your account or
        terminate your account, you can:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {['Log in to your account settings and update your user account.'].map((c, i) => (
          <li key={i} style={s().li}>{c}</li>
        ))}
      </ul>
      <p style={s().p}>
        Upon your request to terminate your account, we will deactivate or delete your account and
        information from our active databases. However, we may retain some information in our files
        to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal
        terms and/or comply with applicable legal requirements.
      </p>
      <p style={s().p}>
        <strong>Cookies and similar technologies:</strong> Most Web browsers are set to accept
        cookies by default. If you prefer, you can usually choose to set your browser to remove
        cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could
        affect certain features or services of our Services. For further information, please see our{' '}
        <a href="/cookie-policy" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Cookie Notice
        </a>
        .
      </p>
      <p style={s().p}>
        If you have questions or comments about your privacy rights, you may email us at{' '}
        <a href="mailto:privacy@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          privacy@syntheonhub.com
        </a>
        .
      </p>

      <h2 style={s().h1}>11. Controls for Do-Not-Track Features</h2>
      <p style={s().p}>
        Most web browsers and some mobile operating systems and mobile applications include a
        Do-Not-Track (&ldquo;DNT&rdquo;) feature or setting you can activate to signal your privacy
        preference not to have data about your online browsing activities monitored and collected.
        At this stage, no uniform technology standard for recognizing and implementing DNT signals
        has been finalized. As such, we do not currently respond to DNT browser signals or any other
        mechanism that automatically communicates your choice not to be tracked online. If a
        standard for online tracking is adopted that we must follow in the future, we will inform
        you about that practice in a revised version of this Privacy Notice.
      </p>

      <h2 style={s().h1}>12. Meeting Recording Consent</h2>
      <p style={s().p}>
        By using Syntheon Hub&rsquo;s meeting bot, you represent and warrant that you have obtained
        consent from all meeting participants before recording. Syntheon Hub is not liable for your
        failure to obtain proper consent. Meeting audio is deleted immediately after transcription.
        Transcripts can be deleted by you at any time via Settings &rarr; Preferences &rarr; Data
        &amp; Privacy.
      </p>

      <h2 style={s().h1}>13. Do We Make Updates to This Notice?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant
        with relevant laws.
      </p>
      <p style={s().p}>
        We may update this Privacy Notice from time to time. The updated version will be indicated
        by an updated &ldquo;Revised&rdquo; date at the top of this Privacy Notice. If we make
        material changes to this Privacy Notice, we may notify you either by prominently posting a
        notice of such changes or by directly sending you a notification. We encourage you to review
        this Privacy Notice frequently to be informed of how we are protecting your information.
      </p>

      <h2 style={s().h1}>14. How Can You Contact Us About This Notice?</h2>
      <p style={s().p}>
        If you have questions or comments about this notice, you may email us at{' '}
        <a href="mailto:privacy@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          privacy@syntheonhub.com
        </a>{' '}
        or contact us by post at:
      </p>
      <p style={{ ...s().p, paddingLeft: '1rem' }}>
        BHUVAN G S
        <br />
        __________
      </p>

      <h2 style={s().h1}>15. How Can You Review, Update, or Delete the Data We Collect From You?</h2>
      <p style={s().p}>
        You have the right to request access to the personal information we collect from you,
        details about how we have processed it, correct inaccuracies, or delete your personal
        information. You may also have the right to withdraw your consent to our processing of your
        personal information. These rights may be limited in some circumstances by applicable law.
        To request to review, update, or delete your personal information, please visit:{' '}
        <a href="https://www.syntheonhub.com/settings" style={{ color: 'rgba(255,255,255,0.5)' }}>
          www.syntheonhub.com/settings
        </a>
        .
      </p>
    </div>
  );

  const Terms = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: March 2026
      </p>

      <h2 style={s().h1}>Terms of Service</h2>
      <p style={s().p}>
        By using Syntheon Hub you agree to these Terms. If you do not agree, do not use the service.
      </p>

      <h2 style={s().h2}>Eligibility</h2>
      <p style={s().p}>
        You must be 18 or older and capable of entering a binding legal agreement.
      </p>

      <h2 style={s().h2}>Subscription and payment</h2>
      <p style={s().p}>
        Plans are billed monthly in INR via Razorpay. Subscriptions auto-renew. You will be notified
        3 days before renewal. Exceeding usage limits pauses the relevant feature until the next
        billing cycle.
      </p>

      <h2 style={s().h2}>Acceptable use</h2>
      <p style={s().p}>
        You may use Syntheon Hub to record and process your own business meetings, extract tickets
        automatically, and organize projects in workspaces you own.
      </p>
      <p style={s().p}>
        You may not record meetings without participant consent, circumvent usage limits, or use the
        service for any illegal purpose under Indian law.
      </p>

      <h2 style={s().h2}>Meeting recording consent</h2>
      <p style={s().p}>
        You are solely responsible for obtaining consent from all meeting participants before using
        the Syntheon Hub bot. Recording laws vary by jurisdiction. By using Syntheon Hub, you
        represent and warrant that you have obtained all necessary consents from meeting
        participants. Syntheon Hub is not liable for your failure to obtain proper consent.
      </p>

      <h2 style={s().h2}>AI-generated content disclaimer</h2>
      <p style={s().p}>
        AI-extracted tickets may contain inaccuracies. You are solely responsible for reviewing all
        extracted tickets before acting on them. Syntheon Hub does not guarantee the accuracy or
        fitness of AI-generated content.
      </p>

      <h2 style={s().h2}>Intellectual property</h2>
      <p style={s().p}>
        You retain full ownership of your meeting transcripts, tickets, and all project data.
        Syntheon Hub claims no ownership over content you create using the platform.
      </p>

      <h2 style={s().h2}>Limitation of liability</h2>
      <p style={s().p}>
        Syntheon Hub's total liability shall not exceed the amount paid in the 3 months preceding
        the claim. We are not liable for indirect, incidental, or consequential damages.
      </p>

      <h2 style={s().h2}>Governing law</h2>
      <p style={s().p}>
        These Terms are governed by the laws of India. Disputes are subject to the exclusive
        jurisdiction of courts in Bengaluru, Karnataka.
      </p>

      <h2 style={s().h2}>Contact</h2>
      <p style={s().p}>
        <a href="mailto:legal@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.3)' }}>
          legal@syntheonhub.com
        </a>
      </p>
    </div>
  );

  const DPA = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: March 2026
      </p>

      <h2 style={s().h1}>Data Processing Agreement</h2>
      <p style={s().p}>
        This DPA governs the processing of personal data by Syntheon Hub ("Data Fiduciary") in
        accordance with the Digital Personal Data Protection Act 2023 and applicable Indian law.
      </p>

      <h2 style={s().h2}>Definitions</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Personal Data — any information relating to an identified or identifiable individual',
          'Data Principal — the individual whose personal data is processed (meeting participants)',
          'Data Fiduciary — Syntheon Hub, which determines the purpose and means of processing personal data',
          'Sub-processor — third-party services engaged by Syntheon Hub to process data on its behalf',
        ].map((d, i) => (
          <li key={i} style={s().li}>
            {d}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>Sub-processors</h2>
      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Service', 'Location', 'Purpose'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 500,
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Skribby', 'EU', 'Meeting transcription'],
              ['Groq', 'USA', 'AI processing'],
              ['Supabase', 'India (Mumbai)', 'Data storage'],
              ['Vercel', 'USA', 'Hosting'],
              ['Clerk', 'USA', 'Authentication'],
              ['Razorpay', 'India', 'Payments'],
            ].map(([s, l, p], i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td
                  style={{
                    padding: '8px 12px',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500,
                  }}
                >
                  {s}
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.5)' }}>{l}</td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.5)' }}>{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={s().h2}>Security measures</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'AES-256 encryption for OAuth tokens at rest',
          'TLS 1.3 for all data in transit',
          'Row-level security in Supabase',
          'No plain-text credential storage',
          'Access logs retained for 90 days',
        ].map((m, i) => (
          <li key={i} style={s().li}>
            {m}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>Data breach notification</h2>
      <p style={s().p}>
        In the event of a personal data breach, Syntheon Hub will notify affected users within 72
        hours and report to the Data Protection Board of India as required.
      </p>

      <h2 style={s().h2}>Contact</h2>
      <p style={s().p}>
        Data Protection Officer:{' '}
        <a href="mailto:privacy@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.3)' }}>
          privacy@syntheonhub.com
        </a>
      </p>
    </div>
  );

  const Refund = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: March 2026
      </p>

      <h2 style={s().h1}>Refund Policy</h2>
      <p style={s().p}>We want you to be completely satisfied with Syntheon Hub.</p>

      <h2 style={s().h2}>7-day money back guarantee</h2>
      <p style={s().p}>
        You are eligible for a full refund if you request it within 7 days of your first payment and
        have processed fewer than 2 meetings. No questions asked.
      </p>

      <h2 style={s().h2}>Service outage refund</h2>
      <p style={s().p}>
        If Syntheon Hub is unavailable for more than 24 continuous hours due to our infrastructure
        (not third-party services), you are eligible for a pro-rated refund for those days.
      </p>

      <h2 style={s().h2}>Non-refundable situations</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Dissatisfaction with AI-extracted ticket quality',
          'Third-party service issues (Skribby, Groq, Clerk)',
          'Your calendar or meeting platform misconfiguration',
          'Unused meetings in a billing period',
          'Cancellation mid-month',
          'Accounts terminated for Terms violations',
        ].map((r, i) => (
          <li key={i} style={s().li}>
            {r}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>How to request</h2>
      <p style={s().p}>
        Email{' '}
        <a href="mailto:refunds@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.3)' }}>
          refunds@syntheonhub.com
        </a>{' '}
        from your registered email with your reason. We respond within 2 business days. Eligible
        refunds are processed within 5-7 business days to your original payment method via Razorpay.
      </p>

      <h2 style={s().h2}>Cancellation</h2>
      <p style={s().p}>
        Cancel anytime from Settings → Billing. Access continues until the end of your current
        billing period. No refund for remaining days unless covered above.
      </p>
    </div>
  );

  const CookiePolicy = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: July 5, 2026
      </p>

      <h2 style={s().h1}>Cookie Policy</h2>
      <p style={s().p}>
        This Cookie Policy explains how Syntheon Hub uses cookies and similar technologies when you
        visit our website or use our app.
      </p>

      <h2 style={s().h2}>What are cookies?</h2>
      <p style={s().p}>
        Cookies are small text files stored on your device. They help us recognize your device,
        remember your preferences, and keep you signed in securely.
      </p>

      <h2 style={s().h2}>Cookies we use</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Authentication cookies — set by Clerk to keep you signed in securely',
          'Preference cookies — remember your theme choice (light/dark/system)',
          'Consent storage — store your DPDP consent preferences locally before authentication',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>Third-party cookies</h2>
      <p style={s().p}>
        Our authentication provider, Clerk, may use cookies to manage sessions and security. We do
        not use advertising or analytics cookies.
      </p>

      <h2 style={s().h2}>Managing cookies</h2>
      <p style={s().p}>
        You can manage or delete cookies through your browser settings. Disabling essential cookies
        may prevent you from signing in or using core features.
      </p>

      <h2 style={s().h2}>Contact</h2>
      <p style={s().p}>
        Questions? Email{' '}
        <a href="mailto:privacy@syntheon.ai" style={{ color: 'rgba(255,255,255,0.3)' }}>
          privacy@syntheon.ai
        </a>
        .
      </p>
    </div>
  );

  const ConsentDPDP = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: July 5, 2026
      </p>

      <h2 style={s().h1}>Consent & DPDP Act 2023</h2>
      <p style={s().p}>
        Syntheon Hub is designed for compliance with the Digital Personal Data Protection Act 2023
        (DPDP Act). We collect and process your personal data only with your free, specific,
        informed, unconditional, and withdrawable consent.
      </p>

      <h2 style={s().h2}>Consent version</h2>
      <p style={s().p}>Current consent version: <strong>dpdp-2023-v1</strong></p>

      <h2 style={s().h2}>What we collect with consent</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Name, email address, and profile information for authentication',
          'Phone number for OTP-based login',
          'Meeting audio and transcripts for AI processing',
          'IP address, device ID, and user agent for consent records',
          'Usage data for product improvement and security',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>Purposes</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Account creation and authentication',
          'Meeting transcription and ticket extraction',
          'Product improvement and analytics',
          'Security and fraud prevention',
          'Compliance with legal obligations',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>Withdrawing consent</h2>
      <p style={s().p}>
        You can withdraw consent at any time by going to Settings → Preferences → Data & Privacy, or
        by emailing{' '}
        <a href="mailto:privacy@syntheon.ai" style={{ color: 'rgba(255,255,255,0.3)' }}>
          privacy@syntheon.ai
        </a>
        . Withdrawing consent may limit your ability to use certain features.
      </p>

      <h2 style={s().h2}>Consent records</h2>
      <p style={s().p}>
        We maintain a record of your consent, including the version, timestamp, purposes, IP address,
        and device information. This helps us demonstrate compliance with DPDP.
      </p>
    </div>
  );

  const UserRights = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: July 5, 2026
      </p>

      <h2 style={s().h1}>Your Rights Under DPDP Act 2023</h2>
      <p style={s().p}>
        As a Data Principal under the DPDP Act, you have the following rights over your personal data:
      </p>

      <h2 style={s().h2}>Right to access</h2>
      <p style={s().p}>
        You can request a copy of all personal data we hold about you, including account
        information, meeting transcripts, tickets, and consent records.
      </p>

      <h2 style={s().h2}>Right to correction</h2>
      <p style={s().p}>
        You can correct inaccuracies in your personal data through your profile settings or by
        contacting us.
      </p>

      <h2 style={s().h2}>Right to erasure</h2>
      <p style={s().p}>
        You can request deletion of your personal data, including transcripts, audio, tickets, and your
        entire account.
      </p>

      <h2 style={s().h2}>Right to grievance redressal</h2>
      <p style={s().p}>
        If you have a complaint about how we handle your data, contact us at{' '}
        <a href="mailto:privacy@syntheon.ai" style={{ color: 'rgba(255,255,255,0.3)' }}>
          privacy@syntheon.ai
        </a>
        . We will respond within 72 hours.
      </p>

      <h2 style={s().h2}>Right to nominate</h2>
      <p style={s().p}>
        You can nominate another individual to exercise your data rights in case of your incapacity or
        death.
      </p>

      <h2 style={s().h2}>Right to withdraw consent</h2>
      <p style={s().p}>
        You can withdraw consent for data processing at any time. Go to Settings → Preferences →
        Data & Privacy or email us to withdraw consent.
      </p>

      <h2 style={s().h2}>How to exercise your rights</h2>
      <p style={s().p}>
        Use the self-service controls in Settings → Preferences → Data & Privacy, or email{' '}
        <a href="mailto:privacy@syntheon.ai" style={{ color: 'rgba(255,255,255,0.3)' }}>
          privacy@syntheon.ai
        </a>
        .
      </p>
    </div>
  );

  const content: Record<string, ReactNode> = {
    privacy: <Privacy />,
    terms: <Terms />,
    cookies: <CookiePolicy />,
    consent: <ConsentDPDP />,
    rights: <UserRights />,
    dpa: <DPA />,
    refund: <Refund />,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        html {
          scroll-behavior: smooth;
          color-scheme: dark;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '0 5vw',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}
        >
          <img
            src="/syntheon-logo.png"
            alt="Syntheon Hub"
            width={28}
            height={28}
            style={{ borderRadius: '6px', objectFit: 'cover' }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Syntheon Hub
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {mounted ? (
            <>
              <Link
                href="/pricing"
                style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                Pricing
              </Link>
              <Link
                href="/how-it-works"
                style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                How it works
              </Link>
              <Link
                href={`${APP_URL}/sign-up`}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000',
                  background: '#fff',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                }}
              >
                Start Free
              </Link>
            </>
          ) : null}
        </div>
      </nav>

      <div
        style={{
          paddingTop: '80px',
          maxWidth: '860px',
          margin: '0 auto',
          padding: '100px 5vw 100px',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Legal documents
          </p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActive(tab.id);
                window.history.replaceState(null, '', `#${tab.id}`);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: active === tab.id ? 'rgba(255,255,255,0.05)' : 'none',
                border: 'none',
                borderLeft:
                  active === tab.id ? '3px solid rgba(255,255,255,0.4)' : '3px solid transparent',
                padding: '10px 16px',
                fontSize: '14px',
                color: active === tab.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontWeight: active === tab.id ? 500 : 300,
                borderRadius: '0 6px 6px 0',
                marginBottom: '4px',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '2.5rem',
          }}
        >
          {content[active]}
        </div>
      </div>

      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '3rem 5vw',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <img
            src="/syntheon-logo.png"
            alt="Syntheon Hub"
            width={24}
            height={24}
            style={{ borderRadius: '4px' }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Syntheon Hub
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link
            href="/"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link
            href="/pricing"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Docs
          </Link>
          <Link
            href="/faq"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            FAQ
          </Link>
          <Link
            href="/how-it-works"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            How it works
          </Link>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          2026 Syntheon Hub. Governed by Indian law.
        </p>
      </footer>
    </div>
  );
}
