import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="mb-4">
        <Link to="/" className="text-blue-500 hover:underline">← Back to Home</Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="mb-2">
            Welcome to Google Photos Unofficial Viewer. We respect your privacy and are committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
          </p>
          <p>
            By using our application, you consent to the collection and use of information in accordance with this policy.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="mb-2">
            <strong>Google Account Information:</strong> When you authenticate with Google, we receive basic profile information such as your name, email address, and profile picture.
          </p>
          <p className="mb-2">
            <strong>Google Photos Access:</strong> With your permission, we access your Google Photos library to display your photos within our application.
          </p>
          <p>
            <strong>Usage Data:</strong> We collect information on how you interact with our application, including pages visited and features used.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-2">
            <li>To provide and maintain our service</li>
            <li>To authenticate you and display your photos</li>
            <li>To improve our application based on how it's used</li>
            <li>To communicate with you about updates or changes</li>
          </ul>
          <p>
            We do not sell or share your personal information with third parties except as described in this policy.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
          <p className="mb-2">
            We store authentication tokens securely to maintain your session. These tokens are encrypted and stored in our database.
          </p>
          <p>
            We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your data.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Your Data Rights</h2>
          <p className="mb-2">
            You have the right to:
          </p>
          <ul className="list-disc pl-6">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time by logging out</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Third-Party Services</h2>
          <p>
            Our application uses Google's authentication and Photos API. Your use of these services is subject to Google's Privacy Policy and Terms of Service.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at praveenpuglia@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 