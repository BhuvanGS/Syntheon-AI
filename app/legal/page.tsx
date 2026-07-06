'use client';

import { useState, useEffect, Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

const APP_URL = 'https://app.syntheonhub.com';

function LegalPageContent() {
  const [active, setActive] = useState('privacy');
  const [mounted, setMounted] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === '1';

  useEffect(() => {
    setMounted(true);
    const hash = window.location.hash.replace('#', '');
    if (hash) setActive(hash);
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn && !isEmbed) {
      router.replace('/settings?tab=legal');
    }
  }, [isLoaded, isSignedIn, isEmbed, router]);

  if (isLoaded && isSignedIn && !isEmbed) {
    return null;
  }

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
          <li key={i} style={s().li}>
            {c}
          </li>
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
        about any of these topics by clicking the link following each key point or by using our
        table of contents below to find the section you are looking for.
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
        Services, express an interest in obtaining information about us or our products and
        Services, when you participate in activities on the Services, or otherwise when you contact
        us.
      </p>
      <p style={s().p}>
        <strong>Personal Information Provided by You.</strong> The personal information that we
        collect depends on the context of your interactions with us and the Services, the choices
        you make, and the products and features you use. The personal information we collect may
        include the following:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Names',
          'Email addresses',
          'Usernames',
          'Contact or authentication data',
          'User-generated content',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
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
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Google API Services User Data Policy
        </a>
        , including the{' '}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy#limited-use"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
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
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>

      <h2 style={s().h1}>3. When and With Whom Do We Share Your Personal Information?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We may share information in specific situations described in this
        section and/or with the following third parties.
      </p>
      <p style={s().p}>
        <strong>Vendors, Consultants, and Other Third-Party Service Providers.</strong> We may share
        your data with third-party vendors, service providers, contractors, or agents (&ldquo;third
        parties&rdquo;) who perform services for us or on our behalf and require access to such
        information to do that work. We have contracts in place with our third parties, which are
        designed to help safeguard your personal information. This means that they cannot do
        anything with your personal information unless we have instructed them to do it. They will
        also not share your personal information with any organization apart from us. They also
        commit to protect the data they hold on our behalf and to retain it for the period we
        instruct.
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
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>
      <p style={s().p}>
        We also may need to share your personal information in the following situations:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>

      <h2 style={s().h1}>4. Do We Use Cookies and Other Tracking Technologies?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We may use cookies and other tracking technologies to collect and
        store your information.
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
          <li key={i} style={s().li}>
            {c}
          </li>
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
          <li key={i} style={s().li}>
            {c}
          </li>
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
        transmission of personal information to and from our Services is at your own risk. You
        should only access the Services within a secure environment.
      </p>

      <h2 style={s().h1}>9. Do We Collect Information From Minors?</h2>
      <p style={s().p}>
        <strong>In Short:</strong> We do not knowingly collect data from or market to children under
        18 years of age.
      </p>
      <p style={s().p}>
        We do not knowingly collect, solicit data from, or market to children under 18 years of age,
        nor do we knowingly sell such personal information. By using the Services, you represent
        that you are at least 18 or that you are the parent or guardian of such a minor and consent
        to such minor dependent&rsquo;s use of the Services. If we learn that personal information
        from users less than 18 years of age has been collected, we will deactivate the account and
        take reasonable measures to promptly delete such data from our records. If you become aware
        of any data we may have collected from children under age 18, please contact us at{' '}
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
          <li key={i} style={s().li}>
            {c}
          </li>
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

      <h2 style={s().h1}>
        15. How Can You Review, Update, or Delete the Data We Collect From You?
      </h2>
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
        Last updated: July 07, 2026
      </p>

      <h2 style={s().h1}>Terms and Conditions</h2>

      <h2 style={s().h2}>Agreement to Our Legal Terms</h2>
      <p style={s().p}>
        We are <strong>BHUVAN G S</strong>, doing business as <strong>Syntheon Hub</strong>
        (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;).
      </p>
      <p style={s().p}>
        We operate the website www.syntheonhub.com (the &ldquo;Site&rdquo;), as well as any other
        related products and services that refer or link to these legal terms (the &ldquo;Legal
        Terms&rdquo;) (collectively, the &ldquo;Services&rdquo;).
      </p>
      <p style={s().p}>
        Syntheon Hub is an AI-powered project management platform that helps teams manage projects,
        meetings, tasks, tickets, sprints, and milestones. The platform uses artificial intelligence
        to analyze meeting transcripts and user-provided content to generate actionable project
        artifacts, improve planning, and enhance team collaboration.
      </p>
      <p style={s().p}>
        You can contact us by phone at +91 99026 80981, email at{' '}
        <a href="mailto:support@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          support@syntheonhub.com
        </a>
        , or by mail to __________, __________, __________.
      </p>
      <p style={s().p}>
        These Legal Terms constitute a legally binding agreement made between you, whether
        personally or on behalf of an entity (&ldquo;you&rdquo;), and BHUVAN G S, concerning your
        access to and use of the Services. You agree that by accessing the Services, you have read,
        understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL
        OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST
        DISCONTINUE USE IMMEDIATELY.
      </p>
      <p style={s().p}>
        We will provide you with prior notice of any scheduled changes to the Services you are
        using. Changes to these Legal Terms will become effective four (4) days after the notice is
        given, except if the changes apply to new functionality, security updates, and bug fixes, in
        which case the changes will be effective immediately. By continuing to use the Services
        after the effective date of any changes, you agree to be bound by the modified terms. If you
        disagree with such changes, you may terminate Services as per the section &ldquo;Term and
        Termination.&rdquo;
      </p>
      <p style={s().p}>
        The Services are intended for users who are at least 18 years old. Persons under the age of
        18 are not permitted to use or register for the Services.
      </p>
      <p style={s().p}>We recommend that you print a copy of these Legal Terms for your records.</p>

      <h2 style={s().h2}>Table of Contents</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Our Services',
          'Intellectual Property Rights',
          'User Representations',
          'Purchases and Payment',
          'Subscriptions',
          'Prohibited Activities',
          'User Generated Contributions',
          'Contribution License',
          'Guidelines for Reviews',
          'Third-Party Websites and Content',
          'Services Management',
          'Privacy Policy',
          'Copyright Infringements',
          'Term and Termination',
          'Modifications and Interruptions',
          'Governing Law',
          'Dispute Resolution',
          'Corrections',
          'Disclaimer',
          'Limitations of Liability',
          'Indemnification',
          'User Data',
          'Electronic Communications, Transactions, and Signatures',
          'Miscellaneous',
          'Contact Us',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {i + 1}. {c}
          </li>
        ))}
      </ul>

      <h2 style={s().h1}>1. Our Services</h2>
      <p style={s().p}>
        The information provided when using the Services is not intended for distribution to or use
        by any person or entity in any jurisdiction or country where such distribution or use would
        be contrary to law or regulation or which would subject us to any registration requirement
        within such jurisdiction or country. Accordingly, those persons who choose to access the
        Services from other locations do so on their own initiative and are solely responsible for
        compliance with local laws, if and to the extent local laws are applicable.
      </p>

      <h2 style={s().h1}>2. Intellectual Property Rights</h2>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Our intellectual property</h3>
      <p style={s().p}>
        We are the owner or the licensee of all intellectual property rights in our Services,
        including all source code, databases, functionality, software, website designs, audio,
        video, text, photographs, and graphics in the Services (collectively, the
        &ldquo;Content&rdquo;), as well as the trademarks, service marks, and logos contained
        therein (the &ldquo;Marks&rdquo;).
      </p>
      <p style={s().p}>
        Our Content and Marks are protected by copyright and trademark laws (and various other
        intellectual property rights and unfair competition laws) and treaties around the world.
      </p>
      <p style={s().p}>
        The Content and Marks are provided in or through the Services &ldquo;AS IS&rdquo; for your
        personal, non-commercial use or internal business purpose only.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Your use of our Services</h3>
      <p style={s().p}>
        Subject to your compliance with these Legal Terms, including the &ldquo;Prohibited
        Activities&rdquo; section below, we grant you a non-exclusive, non-transferable, revocable
        license to:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'access the Services; and',
          'download or print a copy of any portion of the Content to which you have properly gained access,',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>
      <p style={s().p}>
        solely for your personal, non-commercial use or internal business purpose. Except as set out
        in this section or elsewhere in our Legal Terms, no part of the Services and no Content or
        Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly
        displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise
        exploited for any commercial purpose whatsoever, without our express prior written
        permission.
      </p>
      <p style={s().p}>
        If you wish to make any use of the Services, Content, or Marks other than as set out in this
        section or elsewhere in our Legal Terms, please address your request to:{' '}
        <a href="mailto:support@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          support@syntheonhub.com
        </a>
        . If we ever grant you the permission to post, reproduce, or publicly display any part of
        our Services or Content, you must identify us as the owners or licensors of the Services,
        Content, or Marks and ensure that any copyright or proprietary notice appears or is visible
        on posting, reproducing, or displaying our Content.
      </p>
      <p style={s().p}>
        We reserve all rights not expressly granted to you in and to the Services, Content, and
        Marks. Any breach of these Intellectual Property Rights will constitute a material breach of
        our Legal Terms and your right to use our Services will terminate immediately.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Your submissions and contributions</h3>
      <p style={s().p}>
        Please review this section and the &ldquo;Prohibited Activities&rdquo; section carefully
        prior to using our Services to understand the (a) rights you give us and (b) obligations you
        have when you post or upload any content through the Services.
      </p>
      <p style={s().p}>
        <strong>Submissions:</strong> By directly sending us any question, comment, suggestion,
        idea, feedback, or other information about the Services (&ldquo;Submissions&rdquo;), you
        agree to assign to us all intellectual property rights in such Submission. You agree that we
        shall own this Submission and be entitled to its unrestricted use and dissemination for any
        lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
      </p>
      <p style={s().p}>
        <strong>Contributions:</strong> The Services may invite you to chat, contribute to, or
        participate in blogs, message boards, online forums, and other functionality during which
        you may create, submit, post, display, transmit, publish, distribute, or broadcast content
        and materials to us or through the Services, including but not limited to text, writings,
        video, audio, photographs, music, graphics, comments, reviews, rating suggestions, personal
        information, or other material (&ldquo;Contributions&rdquo;). Any Submission that is
        publicly posted shall also be treated as a Contribution.
      </p>
      <p style={s().p}>
        You understand that Contributions may be viewable by other users of the Services and
        possibly through third-party websites.
      </p>
      <p style={s().p}>
        <strong>
          When you post Contributions, you grant us a license (including use of your name,
          trademarks, and logos):
        </strong>{' '}
        By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable,
        perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and
        license to: use, copy, reproduce, distribute, sell, resell, publish, broadcast, retitle,
        store, publicly perform, publicly display, reformat, translate, excerpt (in whole or in
        part), and exploit your Contributions (including, without limitation, your image, name, and
        voice) for any purpose, commercial, advertising, or otherwise, to prepare derivative works
        of, or incorporate into other works, your Contributions, and to sublicense the licenses
        granted in this section. Our use and distribution may occur in any media formats and through
        any media channels.
      </p>
      <p style={s().p}>
        This license includes our use of your name, company name, and franchise name, as applicable,
        and any of the trademarks, service marks, trade names, logos, and personal and commercial
        images you provide.
      </p>
      <p style={s().p}>
        <strong>You are responsible for what you post or upload:</strong> By sending us Submissions
        and/or posting Contributions through any part of the Services or making Contributions
        accessible through the Services by linking your account through the Services to any of your
        social networking accounts, you:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'confirm that you have read and agree with our "Prohibited Activities" and will not post, send, publish, upload, or transmit through the Services any Submission nor post any Contribution that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;',
          'to the extent permissible by applicable law, waive any and all moral rights to any such Submission and/or Contribution;',
          'warrant that any such Submission and/or Contributions are original to you or that you have the necessary rights and licenses to submit such Submissions and/or Contributions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions and/or Contributions; and',
          'warrant and represent that your Submissions and/or Contributions do not constitute confidential information.',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>
      <p style={s().p}>
        You are solely responsible for your Submissions and/or Contributions and you expressly agree
        to reimburse us for any and all losses that we may suffer because of your breach of (a) this
        section, (b) any third party&rsquo;s intellectual property rights, or (c) applicable law.
      </p>
      <p style={s().p}>
        <strong>We may remove or edit your Content:</strong> Although we have no obligation to
        monitor any Contributions, we shall have the right to remove or edit any Contributions at
        any time without notice if in our reasonable opinion we consider such Contributions harmful
        or in breach of these Legal Terms. If we remove or edit any such Contributions, we may also
        suspend or disable your account and report you to the authorities.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Copyright infringement</h3>
      <p style={s().p}>
        We respect the intellectual property rights of others. If you believe that any material
        available on or through the Services infringes upon any copyright you own or control, please
        immediately refer to the &ldquo;Copyright Infringements&rdquo; section below.
      </p>

      <h2 style={s().h1}>3. User Representations</h2>
      <p style={s().p}>
        By using the Services, you represent and warrant that: (1) you have the legal capacity and
        you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in
        which you reside; (3) you will not access the Services through automated or non-human means,
        whether through a bot, script or otherwise; (4) you will not use the Services for any
        illegal or unauthorized purpose; and (5) your use of the Services will not violate any
        applicable law or regulation.
      </p>
      <p style={s().p}>
        If you provide any information that is untrue, inaccurate, not current, or incomplete, we
        have the right to suspend or terminate your account and refuse any and all current or future
        use of the Services (or any portion thereof).
      </p>

      <h2 style={s().h1}>4. Purchases and Payment</h2>
      <p style={s().p}>We accept the following forms of payment:</p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {['Visa', 'Mastercard', 'American Express', 'Discover'].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>
      <p style={s().p}>
        You agree to provide current, complete, and accurate purchase and account information for
        all purchases made via the Services. You further agree to promptly update account and
        payment information, including email address, payment method, and payment card expiration
        date, so that we can complete your transactions and contact you as needed. Sales tax will be
        added to the price of purchases as deemed required by us. We may change prices at any time.
        All payments shall be in US dollars.
      </p>
      <p style={s().p}>
        You agree to pay all charges at the prices then in effect for your purchases and any
        applicable shipping fees, and you authorize us to charge your chosen payment provider for
        any such amounts upon placing your order. We reserve the right to correct any errors or
        mistakes in pricing, even if we have already requested or received payment.
      </p>
      <p style={s().p}>
        We reserve the right to refuse any order placed through the Services. We may, in our sole
        discretion, limit or cancel quantities purchased per person, per household, or per order.
        These restrictions may include orders placed by or under the same customer account, the same
        payment method, and/or orders that use the same billing or shipping address. We reserve the
        right to limit or prohibit orders that, in our sole judgment, appear to be placed by
        dealers, resellers, or distributors.
      </p>

      <h2 style={s().h1}>5. Subscriptions</h2>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Billing and Renewal</h3>
      <p style={s().p}>
        Your subscription will continue and automatically renew unless canceled. You consent to our
        charging your payment method on a recurring basis without requiring your prior approval for
        each recurring charge, until such time as you cancel the applicable order. The length of
        your billing cycle will depend on the type of subscription plan you choose when you
        subscribed to the Services.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Free Trial</h3>
      <p style={s().p}>
        We offer a 15-day free trial to new users who register with the Services. The account will
        not be charged and the subscription will be suspended until upgraded to a paid version at
        the end of the free trial.
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Cancellation</h3>
      <p style={s().p}>
        You can cancel your subscription at any time by logging into your account. Your cancellation
        will take effect at the end of the current paid term. If you have any questions or are
        unsatisfied with our Services, please email us at{' '}
        <a href="mailto:support@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          support@syntheonhub.com
        </a>
        .
      </p>
      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Fee Changes</h3>
      <p style={s().p}>
        We may, from time to time, make changes to the subscription fee and will communicate any
        price changes to you in accordance with applicable law.
      </p>

      <h2 style={s().h1}>6. Prohibited Activities</h2>
      <p style={s().p}>
        You may not access or use the Services for any purpose other than that for which we make the
        Services available. The Services may not be used in connection with any commercial endeavors
        except those that are specifically endorsed or approved by us.
      </p>
      <p style={s().p}>As a user of the Services, you agree not to:</p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.',
          'Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.',
          'Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.',
          'Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.',
          'Use any information obtained from the Services in order to harass, abuse, or harm another person.',
          'Make improper use of our support services or submit false reports of abuse or misconduct.',
          'Use the Services in a manner inconsistent with any applicable laws or regulations.',
          'Engage in unauthorized framing of or linking to the Services.',
          'Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party\u2019s uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.',
          'Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.',
          'Delete the copyright or other proprietary rights notice from any Content.',
          'Attempt to impersonate another user or person or use the username of another user.',
          'Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats ("gifs"), 1\u00d71 pixels, web bugs, cookies, or other similar devices (sometimes referred to as "spyware" or "passive collection mechanisms" or "pcms").',
          'Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.',
          'Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.',
          'Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.',
          "Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.",
          'Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.',
          'Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.',
          'Use a buying agent or purchasing agent to make purchases on the Services.',
          'Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.',
          'Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.',
          'Sell or otherwise transfer your profile.',
          'Use the Services in any manner that could interfere with, disrupt, negatively affect, or inhibit other users from fully enjoying the Services.',
          'Use the Services to violate any law, regulation, or legal obligation.',
          'Infringe upon the rights of others, including intellectual property rights.',
          'Upload or transmit viruses, malware, or other malicious code.',
          'Attempt to gain unauthorized access to any part of the Services.',
          'Collect or harvest personal information of other users.',
          'Use the Services to harass, abuse, or harm others.',
          'Use the Services to send unsolicited communications or spam.',
          'Impersonate another person or entity.',
          'Use the Services in any way that could damage, disable, or impair the Services.',
          'Use the Services to advertise or offer to sell goods and services.',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>

      <h2 style={s().h1}>7. User Generated Contributions</h2>
      <p style={s().p}>
        The Services may invite you to chat, contribute to, or participate in blogs, message boards,
        online forums, and other functionality, and may provide you with the opportunity to create,
        submit, post, display, transmit, perform, publish, distribute, or broadcast content and
        materials to us or on the Services, including but not limited to text, writings, video,
        audio, photographs, graphics, comments, suggestions, or personal information or other
        material (collectively, &ldquo;Contributions&rdquo;). Contributions may be viewable by other
        users of the Services and through third-party websites. As such, any Contributions you
        transmit may be treated as non-confidential and non-proprietary. When you create or make
        available any Contributions, you thereby represent and warrant that:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.',
          'You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.',
          'You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.',
          'Your Contributions are not false, inaccurate, or misleading.',
          'Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.',
          'Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).',
          'Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.',
          'Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.',
          'Your Contributions do not violate any applicable law, regulation, or rule.',
          'Your Contributions do not violate the privacy or publicity rights of any third party.',
          'Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.',
          'Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.',
          'Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.',
        ].map((c, i) => (
          <li key={i} style={s().li}>
            {c}
          </li>
        ))}
      </ul>
      <p style={s().p}>
        Any use of the Services in violation of the foregoing violates these Legal Terms and may
        result in, among other things, termination or suspension of your rights to use the Services.
      </p>

      <h2 style={s().h1}>8. Contribution License</h2>
      <p style={s().p}>
        By posting your Contributions to any part of the Services, you automatically grant, and you
        represent and warrant that you have the right to grant, to us an unrestricted, unlimited,
        irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide
        right, and license to host, use, copy, reproduce, disclose, sell, resell, publish,
        broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat,
        translate, transmit, excerpt (in whole or in part), and distribute such Contributions
        (including, without limitation, your image and voice) for any purpose, commercial,
        advertising, or otherwise, and to prepare derivative works of, or incorporate into other
        works, such Contributions, and grant and authorize sublicenses of the foregoing. The use and
        distribution may occur in any media formats and through any media channels.
      </p>
      <p style={s().p}>
        This license will apply to any form, media, or technology now known or hereafter developed,
        and includes our use of your name, company name, and franchise name, as applicable, and any
        of the trademarks, service marks, trade names, logos, and personal and commercial images you
        provide. You waive all moral rights in your Contributions, and you warrant that moral rights
        have not otherwise been asserted in your Contributions.
      </p>
      <p style={s().p}>
        We do not assert any ownership over your Contributions. You retain full ownership of all of
        your Contributions and any intellectual property rights or other proprietary rights
        associated with your Contributions. We are not liable for any statements or representations
        in your Contributions provided by you in any area on the Services. You are solely
        responsible for your Contributions to the Services and you expressly agree to exonerate us
        from any and all responsibility and to refrain from any legal action against us regarding
        your Contributions.
      </p>
      <p style={s().p}>
        We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise
        change any Contributions; (2) to re-categorize any Contributions to place them in more
        appropriate locations on the Services; and (3) to pre-screen or delete any Contributions at
        any time and for any reason, without notice. We have no obligation to monitor your
        Contributions.
      </p>

      <h2 style={s().h1}>9. Guidelines for Reviews</h2>
      <p style={s().p}>
        We may provide you areas on the Services to leave reviews or ratings. When posting a review,
        you must comply with the following criteria: (1) you should have firsthand experience with
        the person/entity being reviewed; (2) your reviews should not contain offensive profanity,
        or abusive, racist, offensive, or hateful language; (3) your reviews should not contain
        discriminatory references based on religion, race, gender, national origin, age, marital
        status, sexual orientation, or disability; (4) your reviews should not contain references to
        illegal activity; (5) you should not be affiliated with competitors if posting negative
        reviews; (6) you should not make any conclusions as to the legality of conduct; (7) you may
        not post any false or misleading statements; and (8) you may not organize a campaign
        encouraging others to post reviews, whether positive or negative.
      </p>
      <p style={s().p}>
        We may accept, reject, or remove reviews in our sole discretion. We have absolutely no
        obligation to screen reviews or to delete reviews, even if anyone considers reviews
        objectionable or inaccurate. Reviews are not endorsed by us, and do not necessarily
        represent our opinions or the views of any of our affiliates or partners. We do not assume
        liability for any review or for any claims, liabilities, or losses resulting from any
        review. By posting a review, you hereby grant to us a perpetual, non-exclusive, worldwide,
        royalty-free, fully paid, assignable, and sublicensable right and license to reproduce,
        modify, translate, transmit by any means, display, perform, and/or distribute all content
        relating to review.
      </p>

      <h2 style={s().h1}>10. Third-Party Websites and Content</h2>
      <p style={s().p}>
        The Services may contain (or you may be sent via the Site) links to other websites
        (&ldquo;Third-Party Websites&rdquo;) as well as articles, photographs, text, graphics,
        pictures, designs, music, sound, video, information, applications, software, and other
        content or items belonging to or originating from third parties (&ldquo;Third-Party
        Content&rdquo;). Such Third-Party Websites and Third-Party Content are not investigated,
        monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not
        responsible for any Third-Party Websites accessed through the Services or any Third-Party
        Content posted on, available through, or installed from the Services, including the content,
        accuracy, offensiveness, opinions, reliability, privacy practices, or other policies of or
        contained in the Third-Party Websites or the Third-Party Content.
      </p>
      <p style={s().p}>
        Inclusion of, linking to, or permitting the use or installation of any Third-Party Websites
        or any Third-Party Content does not imply approval or endorsement thereof by us. If you
        decide to leave the Services and access the Third-Party Websites or to use or install any
        Third-Party Content, you do so at your own risk, and you should be aware these Legal Terms
        no longer govern. You should review the applicable terms and policies, including privacy and
        data gathering practices, of any website to which you navigate from the Services or relating
        to any applications you use or install from the Services. Any purchases you make through
        Third-Party Websites will be through other websites and from other companies, and we take no
        responsibility whatsoever in relation to such purchases which are exclusively between you
        and the applicable third party. You agree and acknowledge that we do not endorse the
        products or services offered on Third-Party Websites and you shall hold us blameless from
        any harm caused by your purchase of such products or services.
      </p>

      <h2 style={s().h1}>11. Services Management</h2>
      <p style={s().p}>
        We reserve the right, but not the obligation, to: (1) monitor the Services for violations of
        these Legal Terms; (2) take appropriate legal action against anyone who, in our sole
        discretion, violates the law or these Legal Terms, including without limitation, reporting
        such user to law enforcement authorities; (3) in our sole discretion and without limitation,
        refuse, restrict access to, limit the availability of, or disable (to the extent
        technologically feasible) any of your Contributions or any portion thereof; (4) in our sole
        discretion and without limitation, notice, or liability, to remove from the Services or
        otherwise disable all files and content that are excessive in size or are in any way
        burdensome to our systems; and (5) otherwise manage the Services in a manner designed to
        protect our rights and property and to facilitate the proper functioning of the Services.
      </p>

      <h2 style={s().h1}>12. Privacy Policy</h2>
      <p style={s().p}>
        We care about data privacy and security. Please review our{' '}
        <a href="/legal#privacy" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Privacy Policy
        </a>
        . By using the Services, you agree to be bound by our Privacy Policy, which is incorporated
        into these Legal Terms. Please be advised the Services are hosted in India. If you access
        the Services from any other region of the world with laws or other requirements governing
        personal data collection, use, or disclosure that differ from applicable laws in India, then
        through your continued use of the Services, you are transferring your data to India, and you
        expressly consent to have your data transferred to and processed in India.
      </p>

      <h2 style={s().h1}>13. Copyright Infringements</h2>
      <p style={s().p}>
        We respect the intellectual property rights of others. If you believe that any material
        available on or through the Services infringes upon any copyright you own or control, please
        immediately notify us using the contact information provided below (a
        &ldquo;Notification&rdquo;). A copy of your Notification will be sent to the person who
        posted or stored the material addressed in the Notification. Please be advised that pursuant
        to applicable law you may be held liable for damages if you make material misrepresentations
        in a Notification. Thus, if you are not sure that material located on or linked to by the
        Services infringes your copyright, you should consider first contacting an attorney.
      </p>

      <h2 style={s().h1}>14. Term and Termination</h2>
      <p style={s().p}>
        These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT
        LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE
        DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES
        (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON,
        INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT
        CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR
        USE OR PARTICIPATION IN THE SERVICES OR DELETE ANY CONTENT OR INFORMATION THAT YOU POSTED AT
        ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
      </p>
      <p style={s().p}>
        If we terminate or suspend your account for any reason, you are prohibited from registering
        and creating a new account under your name, a fake or borrowed name, or the name of any
        third party, even if you may be acting on behalf of the third party. In addition to
        terminating or suspending your account, we reserve the right to take appropriate legal
        action, including without limitation pursuing civil, criminal, and injunctive redress.
      </p>

      <h2 style={s().h1}>15. Modifications and Interruptions</h2>
      <p style={s().p}>
        We reserve the right to change, modify, or remove the contents of the Services at any time
        or for any reason at our sole discretion without notice. However, we have no obligation to
        update any information on our Services. We will not be liable to you or any third party for
        any modification, price change, suspension, or discontinuance of the Services.
      </p>
      <p style={s().p}>
        We cannot guarantee the Services will be available at all times. We may experience hardware,
        software, or other problems or need to perform maintenance related to the Services,
        resulting in interruptions, delays, or errors. We reserve the right to change, revise,
        update, suspend, discontinue, or otherwise modify the Services at any time or for any reason
        without notice to you. You agree that we have no liability whatsoever for any loss, damage,
        or inconvenience caused by your inability to access or use the Services during any downtime
        or discontinuance of the Services. Nothing in these Legal Terms will be construed to
        obligate us to maintain and support the Services or to supply any corrections, updates, or
        releases in connection therewith.
      </p>

      <h2 style={s().h1}>16. Governing Law</h2>
      <p style={s().p}>
        These Legal Terms shall be governed by and defined following the laws of India. BHUVAN G S
        and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction
        to resolve any dispute which may arise in connection with these Legal Terms.
      </p>

      <h2 style={s().h1}>17. Dispute Resolution</h2>
      <p style={s().p}>
        You agree to irrevocably submit all disputes related to these Legal Terms or the legal
        relationship established by these Legal Terms to the jurisdiction of the India courts.
        BHUVAN G S shall also maintain the right to bring proceedings as to the substance of the
        matter in the courts of the country where you reside or, if these Legal Terms are entered
        into in the course of your trade or profession, the state of your principal place of
        business.
      </p>

      <h2 style={s().h1}>18. Corrections</h2>
      <p style={s().p}>
        There may be information on the Services that contains typographical errors, inaccuracies,
        or omissions, including descriptions, pricing, availability, and various other information.
        We reserve the right to correct any errors, inaccuracies, or omissions and to change or
        update the information on the Services at any time, without prior notice.
      </p>

      <h2 style={s().h1}>19. Disclaimer</h2>
      <p style={s().p}>
        THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE
        SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
        WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF,
        INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE
        ACCURACY OR COMPLETENESS OF THE SERVICES&rsquo; CONTENT OR THE CONTENT OF ANY WEBSITES OR
        MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY
        FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY
        OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE
        SERVICES, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL
        PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR
        CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR
        THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6)
        ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND
        INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE
        AVAILABLE VIA THE SERVICES.
      </p>
      <p style={s().p}>
        WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE
        ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY
        WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT
        BE A PARTY TO OR IN ANY WAY RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY
        THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE
        THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE
        CAUTION WHERE APPROPRIATE.
      </p>

      <h2 style={s().h1}>20. Limitations of Liability</h2>
      <p style={s().p}>
        IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD
        PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE
        DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM
        YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY
        CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO
        THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE THREE (3) MONTH PERIOD PRIOR TO ANY CAUSE
        OF ACTION ARISING. CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON
        IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO
        YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY
        HAVE ADDITIONAL RIGHTS.
      </p>

      <h2 style={s().h1}>21. Indemnification</h2>
      <p style={s().p}>
        You agree to defend, indemnify, and hold us harmless, including our subsidiaries,
        affiliates, and all of our respective officers, agents, partners, and employees, from and
        against any loss, damage, liability, claim, or demand, including reasonable attorneys&rsquo;
        fees and expenses, made by any third party due to or arising out of: (1) your Contributions;
        (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your
        representations and warranties set forth in these Legal Terms; (5) your violation of the
        rights of a third party, including but not limited to intellectual property rights; or (6)
        any overt harmful act toward any other user of the Services with whom you connected via the
        Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume
        the exclusive defense and control of any matter for which you are required to indemnify us,
        and you agree to cooperate, at your expense, with our defense of such claims. We will use
        reasonable efforts to notify you of any such claim, action, or proceeding which is subject
        to this indemnification upon becoming aware of it.
      </p>

      <h2 style={s().h1}>22. User Data</h2>
      <p style={s().p}>
        We will maintain certain data that you transmit to the Services for the purpose of managing
        the performance of the Services, as well as data relating to your use of the Services.
        Although we perform regular routine backups of data, you are solely responsible for all data
        that you transmit or that relates to any activity you have undertaken using the Services.
        You agree that we shall have no liability to you for any loss or corruption of any such
        data, and you hereby waive any right of action against us arising from any such loss or
        corruption of such data.
      </p>

      <h2 style={s().h1}>23. Electronic Communications, Transactions, and Signatures</h2>
      <p style={s().p}>
        Visiting the Services, sending us emails, and completing online forms constitute electronic
        communications. You consent to receive electronic communications, and you agree that all
        agreements, notices, disclosures, and other communications we provide to you electronically,
        via email and on the Services, satisfy any legal requirement that such communication be in
        writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER
        RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS
        INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or
        requirements under any statutes, regulations, rules, ordinances, or other laws in any
        jurisdiction which require an original signature or delivery or retention of non-electronic
        records, or to payments or the granting of credits by any means other than electronic means.
      </p>

      <h2 style={s().h1}>24. Miscellaneous</h2>
      <p style={s().p}>
        These Legal Terms and any policies or operating rules posted by us on the Services or in
        respect of the Services constitute the entire agreement and understanding between you and
        us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not
        operate as a waiver of such right or provision. These Legal Terms operate to the fullest
        extent permissible by law. We may assign any or all of our rights and obligations to others
        at any time. We shall not be responsible or liable for any loss, damage, delay, or failure
        to act caused by any cause beyond our reasonable control. If any provision or part of a
        provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that
        provision or part of the provision is deemed severable from these Legal Terms and does not
        affect the validity and enforceability of any remaining provisions. There is no joint
        venture, partnership, employment or agency relationship created between you and us as a
        result of these Legal Terms or use of the Services. You agree that these Legal Terms will
        not be construed against us by virtue of having drafted them. You hereby waive any and all
        defenses you may have based on the electronic form of these Legal Terms and the lack of
        signing by the parties hereto to execute these Legal Terms.
      </p>

      <h2 style={s().h1}>25. Contact Us</h2>
      <p style={s().p}>
        In order to resolve a complaint regarding the Services or to receive further information
        regarding use of the Services, please contact us at:
      </p>
      <p style={{ ...s().p, paddingLeft: '1rem' }}>
        BHUVAN G S
        <br />
        Phone: +91 99026 80981
        <br />
        <a href="mailto:support@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          support@syntheonhub.com
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
        Last updated: July 05, 2026
      </p>

      <h2 style={s().h1}>Cookie Policy</h2>
      <p style={s().p}>
        This Cookie Policy explains how <strong>BHUVAN G S</strong> (&ldquo;Company,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; and &ldquo;our&rdquo;) uses cookies and similar
        technologies to recognize you when you visit our website at www.syntheonhub.com (the
        &ldquo;Website&rdquo;). It explains what these technologies are and why we use them, as well
        as your rights to control our use of them.
      </p>
      <p style={s().p}>
        In some cases we may use cookies to collect personal information, or that becomes personal
        information if we combine it with other information.
      </p>

      <h2 style={s().h2}>What are cookies?</h2>
      <p style={s().p}>
        Cookies are small data files that are placed on your computer or mobile device when you
        visit a website. Cookies are widely used by website owners in order to make their websites
        work, or to work more efficiently, as well as to provide reporting information.
      </p>
      <p style={s().p}>
        Cookies set by the website owner (in this case, BHUVAN G S) are called &ldquo;first-party
        cookies.&rdquo; Cookies set by parties other than the website owner are called
        &ldquo;third-party cookies.&rdquo; Third-party cookies enable third-party features or
        functionality to be provided on or through the website (e.g., advertising, interactive
        content, and analytics). The parties that set these third-party cookies can recognize your
        computer both when it visits the website in question and also when it visits certain other
        websites.
      </p>

      <h2 style={s().h2}>Why do we use cookies?</h2>
      <p style={s().p}>
        We use first- and third-party cookies for several reasons. Some cookies are required for
        technical reasons in order for our Website to operate, and we refer to these as
        &ldquo;essential&rdquo; or &ldquo;strictly necessary&rdquo; cookies. Other cookies also
        enable us to track and target the interests of our users to enhance the experience on our
        Online Properties. Third parties serve cookies through our Website for advertising,
        analytics, and other purposes. This is described in more detail below.
      </p>

      <h2 style={s().h2}>How can I control cookies?</h2>
      <p style={s().p}>
        You have the right to decide whether to accept or reject cookies. You can exercise your
        cookie rights by setting your preferences in the Cookie Preference Center. The Cookie
        Preference Center allows you to select which categories of cookies you accept or reject.
        Essential cookies cannot be rejected as they are strictly necessary to provide you with
        services.
      </p>
      <p style={s().p}>
        The Cookie Preference Center can be found in the notification banner and on our Website. If
        you choose to reject cookies, you may still use our Website though your access to some
        functionality and areas of our Website may be restricted. You may also set or amend your web
        browser controls to accept or refuse cookies.
      </p>
      <p style={s().p}>
        The specific types of first- and third-party cookies served through our Website and the
        purposes they perform are described in the table below (please note that the specific
        cookies served may vary depending on the specific Online Properties you visit):
      </p>

      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Essential website cookies</h3>
      <p style={s().p}>
        These cookies are strictly necessary to provide you with services available through our
        Website and to use some of its features, such as access to secure areas.
      </p>
      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Name', 'Purpose', 'Provider', 'Service', 'Type', 'Expires'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                <code style={{ fontSize: '12px' }}>__cf_bm</code>
              </td>
              <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                Cloudflare places the cookie on end-user devices that access customer sites
                protected by Bot Management or Bot Fight Mode.
              </td>
              <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                .causal-viper-48.clerk.accounts.dev
              </td>
              <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>Cloudflare</td>
              <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>HTTP Cookie</td>
              <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>29 minutes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Performance and functionality cookies</h3>
      <p style={s().p}>
        These cookies are used to enhance the performance and functionality of our Website but are
        non-essential to their use. However, without these cookies, certain functionality (like
        videos) may become unavailable.
      </p>
      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Name', 'Purpose', 'Provider', 'Service', 'Type', 'Expires'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                name: '_cfuvid',
                purpose:
                  'This cookie is set by Cloudflare to enhance security and performance. It helps identify trusted web traffic and ensures a secure browsing experience for users.',
                provider: '.clerkprod-cloudflare.net',
                expires: 'Session',
              },
              {
                name: '_cfuvid',
                purpose:
                  'This cookie is set by Cloudflare to enhance security and performance. It helps identify trusted web traffic and ensures a secure browsing experience for users.',
                provider: '.causal-viper-48.clerk.accounts.dev',
                expires: 'Session',
              },
            ].map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                  <code style={{ fontSize: '12px' }}>{c.name}</code>
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>{c.purpose}</td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                  {c.provider}
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>Cloudflare</td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                  Server Cookie
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>{c.expires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ ...s().h2, fontSize: '1rem' }}>Unclassified cookies</h3>
      <p style={s().p}>
        These are cookies that have not yet been categorized. We are in the process of classifying
        these cookies with the help of their providers.
      </p>
      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Name', 'Provider', 'Type', 'Expires'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                name: '__clerk_db_jwt_hIwMqtWr',
                provider: 'www.syntheonhub.com',
                type: 'HTTP Cookie',
                expires: '11 months 30 days',
              },
              {
                name: '__clerk_db_jwt',
                provider: 'www.syntheonhub.com',
                type: 'Server Cookie',
                expires: '11 months 30 days',
              },
              {
                name: '__clerk_redirect_count',
                provider: 'www.syntheonhub.com',
                type: 'Server Cookie',
                expires: 'less than 1 minute',
              },
              {
                name: '__client_uat',
                provider: '.syntheonhub.com',
                type: 'Server Cookie',
                expires: '9 years 11 months 28 days',
              },
              {
                name: '__clerk_environment',
                provider: 'www.syntheonhub.com',
                type: 'Local Storage',
                expires: 'Persistent',
              },
              {
                name: '__client_uat_hIwMqtWr',
                provider: '.syntheonhub.com',
                type: 'HTTP Cookie',
                expires: '11 months 30 days',
              },
            ].map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                  <code style={{ fontSize: '12px' }}>{c.name}</code>
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>
                  {c.provider}
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>{c.type}</td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.7)' }}>{c.expires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={s().h2}>How can I control cookies on my browser?</h2>
      <p style={s().p}>
        As the means by which you can refuse cookies through your web browser controls vary from
        browser to browser, you should visit your browser&rsquo;s help menu for more information.
        The following is information about how to manage cookies on the most popular browsers:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          {
            label: 'Chrome',
            url: 'https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies',
          },
          {
            label: 'Internet Explorer',
            url: 'https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d',
          },
          {
            label: 'Firefox',
            url: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop',
          },
          { label: 'Safari', url: 'https://support.apple.com/en-ie/guide/safari/sfri11471/mac' },
          {
            label: 'Edge',
            url: 'https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd',
          },
          { label: 'Opera', url: 'https://help.opera.com/en/latest/web-preferences/' },
        ].map((b) => (
          <li key={b.label} style={s().li}>
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {b.label}
            </a>
          </li>
        ))}
      </ul>
      <p style={s().p}>
        In addition, most advertising networks offer you a way to opt out of targeted advertising.
        If you would like to find out more information, please visit:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'Digital Advertising Alliance', url: 'http://www.aboutads.info/choices/' },
          { label: 'Digital Advertising Alliance of Canada', url: 'https://youradchoices.ca/' },
          {
            label: 'European Interactive Digital Advertising Alliance',
            url: 'http://www.youronlinechoices.com/',
          },
        ].map((a) => (
          <li key={a.label} style={s().li}>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {a.label}
            </a>
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>What about other tracking technologies, like web beacons?</h2>
      <p style={s().p}>
        Cookies are not the only way to recognize or track visitors to a website. We may use other,
        similar technologies from time to time, like web beacons (sometimes called &ldquo;tracking
        pixels&rdquo; or &ldquo;clear gifs&rdquo;). These are tiny graphics files that contain a
        unique identifier that enables us to recognize when someone has visited our Website or
        opened an email including them. This allows us, for example, to monitor the traffic patterns
        of users from one page within a website to another, to deliver or communicate with cookies,
        to understand whether you have come to the website from an online advertisement displayed on
        a third-party website, to improve site performance, and to measure the success of email
        marketing campaigns. In many instances, these technologies are reliant on cookies to
        function properly, and so declining cookies will impair their functioning.
      </p>

      <h2 style={s().h2}>Do you use Flash cookies or Local Shared Objects?</h2>
      <p style={s().p}>
        Websites may also use so-called &ldquo;Flash Cookies&rdquo; (also known as Local Shared
        Objects or &ldquo;LSOs&rdquo;) to, among other things, collect and store information about
        your use of our services, fraud prevention, and for other site operations.
      </p>
      <p style={s().p}>
        If you do not want Flash Cookies stored on your computer, you can adjust the settings of
        your Flash player to block Flash Cookies storage using the tools contained in the{' '}
        <a
          href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Website Storage Settings Panel
        </a>
        . You can also control Flash Cookies by going to the{' '}
        <a
          href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Global Storage Settings Panel
        </a>{' '}
        and following the instructions (which may include instructions that explain, for example,
        how to delete existing Flash Cookies (referred to &ldquo;information&rdquo; on the
        Macromedia site), how to prevent Flash LSOs from being placed on your computer without your
        being asked, and (for Flash Player 8 and later) how to block Flash Cookies that are not
        being delivered by the operator of the page you are on at the time).
      </p>
      <p style={s().p}>
        Please note that setting the Flash Player to restrict or limit acceptance of Flash Cookies
        may reduce or impede the functionality of some Flash applications, including, potentially,
        Flash applications used in connection with our services or online content.
      </p>

      <h2 style={s().h2}>Do you serve targeted advertising?</h2>
      <p style={s().p}>
        Third parties may serve cookies on your computer or mobile device to serve advertising
        through our Website. These companies may use information about your visits to this and other
        websites in order to provide relevant advertisements about goods and services that you may
        be interested in. They may also employ technology that is used to measure the effectiveness
        of advertisements. They can accomplish this by using cookies or web beacons to collect
        information about your visits to this and other sites in order to provide relevant
        advertisements about goods and services of potential interest to you. The information
        collected through this process does not enable us or them to identify your name, contact
        details, or other details that directly identify you unless you choose to provide these.
      </p>

      <h2 style={s().h2}>How often will you update this Cookie Policy?</h2>
      <p style={s().p}>
        We may update this Cookie Policy from time to time in order to reflect, for example, changes
        to the cookies we use or for other operational, legal, or regulatory reasons. Please
        therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and
        related technologies.
      </p>
      <p style={s().p}>
        The date at the top of this Cookie Policy indicates when it was last updated.
      </p>

      <h2 style={s().h2}>Where can I get further information?</h2>
      <p style={s().p}>
        If you have any questions about our use of cookies or other technologies, please contact us
        at:
      </p>
      <p style={{ ...s().p, paddingLeft: '1rem' }}>
        BHUVAN G S
        <br />
        Phone: +91 99026 80981
        <br />
        <a href="mailto:support@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.5)' }}>
          support@syntheonhub.com
        </a>
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
      <p style={s().p}>
        Current consent version: <strong>dpdp-2023-v1</strong>
      </p>

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
        We maintain a record of your consent, including the version, timestamp, purposes, IP
        address, and device information. This helps us demonstrate compliance with DPDP.
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
        As a Data Principal under the DPDP Act, you have the following rights over your personal
        data:
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
        You can request deletion of your personal data, including transcripts, audio, tickets, and
        your entire account.
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
        You can nominate another individual to exercise your data rights in case of your incapacity
        or death.
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
        @media (max-width: 1024px) {
          .legal-layout {
            display: block !important;
            padding: 92px 1rem 80px !important;
          }
          .legal-sidebar {
            position: static !important;
            top: auto !important;
            margin-bottom: 1rem;
          }
          .legal-content {
            padding: 0 !important;
          }
        }
      `}</style>

      {!isEmbed && (
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              textDecoration: 'none',
            }}
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
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                  }}
                >
                  Pricing
                </Link>
                <Link
                  href="/how-it-works"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                  }}
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
      )}

      <div
        className="legal-layout"
        style={{
          paddingTop: isEmbed ? '16px' : '80px',
          width: '100%',
          margin: '0',
          padding: isEmbed ? '24px 2vw 24px' : '100px 3vw 100px',
          display: 'grid',
          gridTemplateColumns: '260px minmax(0, 1fr)',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Sidebar */}
        <div
          className="legal-sidebar"
          style={{
            position: 'sticky',
            top: '90px',
            alignSelf: 'start',
            background: 'rgba(39,39,42,0.78)',
            border: '1px solid rgba(113,113,122,0.45)',
            borderRadius: '12px',
            padding: '1rem',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(212,212,216,0.75)',
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
                background: active === tab.id ? 'rgba(82,82,91,0.65)' : 'transparent',
                border: 'none',
                borderLeft:
                  active === tab.id ? '3px solid rgba(244,244,245,0.95)' : '3px solid transparent',
                padding: '10px 16px',
                fontSize: '14px',
                color: active === tab.id ? 'rgba(250,250,250,0.98)' : 'rgba(212,212,216,0.78)',
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
          className="legal-content"
          style={{
            width: '100%',
            maxWidth: 'none',
            padding: '0.5rem 0',
          }}
        >
          {content[active]}
        </div>
      </div>

      {!isEmbed && (
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
      )}
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0b' }} />}>
      <LegalPageContent />
    </Suspense>
  );
}
