<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Accordion from "$lib/components/ui/accordion";
    import { Shield, ArrowLeft, Lock, Eye, Globe, User } from "lucide-svelte";
</script>

<svelte:head>
    <title>Privacy Policy | ContractChecker.net</title>
    <meta name="description" content="ContractChecker.net Privacy Policy - Learn how we protect your data and privacy." />
    <link rel="canonical" href="https://www.contractchecker.net/privacy" />
</svelte:head>

<div class="min-h-screen bg-slate-50 font-sans">
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="/" class="flex items-center gap-2">
                    <img
                        src="https://storage.contractchecker.net/header.webp"
                        alt="ContractChecker Logo"
                        class="h-10 w-auto"
                    />
                </a>
                <a href="/" class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-electric-blue transition-colors">
                    <ArrowLeft class="h-4 w-4" />
                    Back to Home
                </a>
            </div>
        </div>
    </nav>

    <div class="max-w-4xl mx-auto px-4 py-12">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
            <div class="flex items-center gap-3 mb-8">
                <div class="w-12 h-12 rounded-full bg-electric-blue/10 flex items-center justify-center">
                    <Shield class="h-6 w-6 text-electric-blue" />
                </div>
                <div>
                    <h1 class="font-serif text-3xl font-bold text-deep-justice">Privacy Policy</h1>
                    <p class="text-sm text-slate-500">Effective Date: February 23, 2026</p>
                </div>
            </div>

            <div class="prose prose-slate max-w-none space-y-8">
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
                    <p class="text-sm text-slate-600 font-medium">
                        <strong>IMPORTANT:</strong> This Privacy Policy describes how ContractChecker.net collects, uses, and protects Your information. By using the Service, You consent to the data practices described in this policy.
                    </p>
                </div>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">1. INTRODUCTION</h2>
                    <p class="text-slate-600 mb-4">
                        ContractChecker.net ("we," "us," or "our") is committed to protecting Your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard Your information when You use our web application and services (the "Service").
                    </p>
                    <p class="text-slate-600">
                        We are a technology company, not a law firm or financial institution. We do not provide legal or financial advice.
                    </p>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">2. STRICT LIMITATION ON DATA COLLECTION</h2>
                    <div class="bg-verdict-green/10 p-4 rounded-lg border border-verdict-green/30 mb-4">
                        <p class="text-verdict-green font-bold text-sm mb-2">✓ MINIMAL DATA COLLECTION POLICY</p>
                        <p class="text-slate-600 text-sm">
                            We collect ONLY the data necessary to provide and secure our Service. We do NOT collect names, email addresses, phone numbers, financial data, or other personally identifiable information unless You voluntarily provide it.
                        </p>
                    </div>

                    <h3 class="font-bold text-deep-justice mb-3">2.1 Data We Collect</h3>
                    <div class="overflow-x-auto mb-4">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-slate-200">
                                    <th class="text-left py-3 px-4 font-bold text-deep-justice">Data Type</th>
                                    <th class="text-left py-3 px-4 font-bold text-deep-justice">Collected</th>
                                    <th class="text-left py-3 px-4 font-bold text-deep-justice">Purpose</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3 px-4 text-slate-600">Device ID</td>
                                    <td class="py-3 px-4"><span class="text-verdict-green font-bold">YES</span></td>
                                    <td class="py-3 px-4 text-slate-600">Security, fraud prevention, service delivery</td>
                                </tr>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3 px-4 text-slate-600">Name</td>
                                    <td class="py-3 px-4"><span class="text-gavel-red font-bold">NO</span></td>
                                    <td class="py-3 px-4 text-slate-400">Not collected</td>
                                </tr>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3 px-4 text-slate-600">Email Address</td>
                                    <td class="py-3 px-4"><span class="text-gavel-red font-bold">NO</span></td>
                                    <td class="py-3 px-4 text-slate-400">Not collected</td>
                                </tr>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3 px-4 text-slate-600">Phone Number</td>
                                    <td class="py-3 px-4"><span class="text-gavel-red font-bold">NO</span></td>
                                    <td class="py-3 px-4 text-slate-400">Not collected</td>
                                </tr>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3 px-4 text-slate-600">Financial Data</td>
                                    <td class="py-3 px-4"><span class="text-gavel-red font-bold">NO</span></td>
                                    <td class="py-3 px-4 text-slate-400">Not collected</td>
                                </tr>
                                <tr>
                                    <td class="py-3 px-4 text-slate-600">Payment Information</td>
                                    <td class="py-3 px-4"><span class="text-gavel-red font-bold">NO</span></td>
                                    <td class="py-3 px-4 text-slate-400">Processed by third-party payment processors only</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">3. DEVICE ID – LAWFUL BASIS FOR PROCESSING</h2>
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                        <p class="text-electric-blue font-bold text-sm mb-2">GDPR & UK-GDPR COMPLIANCE</p>
                        <p class="text-slate-600 text-sm">
                            We process Your Device ID in compliance with the General Data Protection Regulation (EU) 2016/679 ("GDPR") and the UK General Data Protection Regulation ("UK-GDPR").
                        </p>
                    </div>

                    <h3 class="font-bold text-deep-justice mb-3">3.1 What is a Device ID?</h3>
                    <p class="text-slate-600 mb-4">
                        A Device ID is a unique identifier generated by Your web browser or device operating system. It is a random string of characters used to distinguish Your device from other users' devices. The Device ID does not reveal Your name, location, or personal contact information.
                    </p>

                    <h3 class="font-bold text-deep-justice mb-3">3.2 Lawful Basis for Processing (GDPR Article 6)</h3>
                    <p class="text-slate-600 mb-4">
                        We process Your Device ID under the following lawful bases:
                    </p>
                    <ul class="list-disc pl-6 space-y-2 text-slate-600">
                        <li><strong>Legitimate Interest (Article 6(1)(f)):</strong> The processing is necessary for our legitimate interests, namely:
                            <ul class="list-circle pl-6 mt-2 space-y-1">
                                <li>Ensuring the security and integrity of our Service;</li>
                                <li>Preventing fraud, abuse, and unauthorized access;</li>
                                <li>Maintaining service quality and functionality;</li>
                                <li>Providing and improving our Services.</li>
                            </ul>
                        </li>
                        <li><strong>Strictly Necessary (Article 6(1)(b)):</strong> The processing is necessary for the performance of a contract to provide the Service to You.</li>
                    </ul>

                    <h3 class="font-bold text-deep-justice mb-3">3.3 Legal Basis Under UK-GDPR</h3>
                    <p class="text-slate-600">
                        For users in the United Kingdom, we rely on the same lawful bases under the UK-GDPR (Schedule 2 to the Data Protection Act 2018), specifically:
                    </p>
                    <ul class="list-disc pl-6 space-y-2 text-slate-600 mt-2">
                        <li>Legitimate Interests (UK-GDPR Article 6(1)(f));</li>
                        <li>Necessary for the performance of a contract (UK-GDPR Article 6(1)(b)).</li>
                    </ul>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">4. HOW WE USE YOUR INFORMATION</h2>
                    <p class="text-slate-600 mb-4">We use the Device ID we collect for the following purposes:</p>
                    <ul class="list-disc pl-6 space-y-2 text-slate-600">
                        <li><strong>Service Delivery:</strong> To provide, maintain, and improve our Service;</li>
                        <li><strong>Security:</strong> To detect, prevent, and address fraud, security breaches, and other prohibited activities;</li>
                        <li><strong>Analytics:</strong> To understand how users interact with our Service (in aggregate, anonymized form only);</li>
                        <li><strong>Troubleshooting:</strong> To identify and resolve technical issues;</li>
                        <li><strong>Compliance:</strong> To comply with legal obligations and enforce our Terms of Service.</li>
                    </ul>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">5. DATA RETENTION</h2>
                    <p class="text-slate-600 mb-4">
                        We retain Your Device ID only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. Specifically:
                    </p>
                    <ul class="list-disc pl-6 space-y-2 text-slate-600">
                        <li>Device ID data is retained for a maximum period of 12 months from the date of collection;</li>
                        <li>After this period, the data is automatically deleted or anonymized;</li>
                        <li>We do not retain any contract documents You upload – they are processed in memory and deleted immediately after analysis.</li>
                    </ul>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">6. YOUR RIGHTS (GDPR, UK-GDPR, CCPA, PIPEDA, APP)</h2>
                    <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                        <p class="text-slate-600 font-bold text-sm mb-2">YOUR DATA PROTECTION RIGHTS</p>
                    </div>

                    <h3 class="font-bold text-deep-justice mb-3">6.1 GDPR & UK-GDPR Rights (EU/UK Users)</h3>
                    <p class="text-slate-600 mb-4">If You are located in the EU or UK, You have the following rights:</p>
                    <ul class="list-disc pl-6 space-y-2 text-slate-600 mb-4">
                        <li><strong>Right to Access:</strong> You may request a copy of the personal data we hold about You;</li>
                        <li><strong>Right to Rectification:</strong> You may request correction of inaccurate personal data;</li>
                        <li><strong>Right to Erasure:</strong> You may request deletion of Your personal data ("right to be forgotten");</li>
                        <li><strong>Right to Restrict Processing:</strong> You may request restriction of processing;</li>
                        <li><strong>Right to Data Portability:</strong> You may request transfer of Your data to another controller;</li>
                        <li><strong>Right to Object:</strong> You may object to processing based on legitimate interests;</li>
                        <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, You may withdraw consent at any time.</li>
                    </ul>

                    <h3 class="font-bold text-deep-justice mb-3">6.2 CCPA Rights (California Residents)</h3>
                    <p class="text-slate-600 mb-4">If You are a California resident, You have the following rights under the California Consumer Privacy Act (CCPA):</p>
                    <ul class="list-disc pl-6 space-y-2 text-slate-600 mb-4">
                        <li><strong>Right to Know:</strong> You may request disclosure of the categories and specific pieces of personal information collected;</li>
                        <li><strong>Right to Delete:</strong> You may request deletion of personal information;</li>
                        <li><strong>Right to Opt-Out:</strong> You may opt out of the sale of personal information.</li>
                    </ul>
                    <p class="text-slate-600 mb-4">
                        <strong>Note:</strong> We do NOT sell Your personal information. We do NOT collect "sensitive personal information" as defined by CCPA.
                    </p>

                    <h3 class="font-bold text-deep-justice mb-3">6.3 PIPEDA Rights (Canada)</h3>
                    <p class="text-slate-600 mb-4">If You are located in Canada, You have rights under the Personal Information Protection and Electronic DocumentsEDA), including the Act (PIP right to access, correct, and withdraw consent for processing of Your personal information.</p>

                    <h3 class="font-bold text-deep-justice mb-3">6.4 APP Rights (Australia)</h3>
                    <p class="text-slate-600">If You are located in Australia, You have rights under the Australian Privacy Principles (APP), including the right to access, correct, and complain about a breach of the APP.</p>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">7. INTERNATIONAL DATA TRANSFERS</h2>
                    <p class="text-slate-600 mb-4">
                        Your information may be transferred to and processed in countries other than Your country of residence. However, we ensure that such transfers are conducted in compliance with applicable data protection laws, including:
                    </p>
                    <ul class="list-disc pl-6 space-y-2 text-slate-600">
                        <li>For EU/UK transfers: Standard Contractual Clauses (SCCs) or adequacy decisions;</li>
                        <li>For international transfers: Appropriate safeguards as required by law.</li>
                    </ul>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">8. DATA SECURITY</h2>
                    <div class="flex items-start gap-3 mb-4">
                        <Lock class="h-5 w-5 text-verdict-green shrink-0 mt-0.5" />
                        <div>
                            <p class="text-slate-600">
                                We implement appropriate technical and organizational security measures to protect Your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                            </p>
                            <ul class="list-disc pl-6 space-y-1 text-slate-600 mt-2">
                                <li>Encryption of data in transit (TLS/SSL);</li>
                                <li>Secure storage with access controls;</li>
                                <li>Regular security assessments and audits;</li>
                                <li>Employee training on data protection.</li>
                            </ul>
                        </div>
                    </div>
                    <p class="text-slate-600">
                        However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect Your information, we cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">9. THIRD-PARTY SERVICES</h2>
                    <p class="text-slate-600 mb-4">
                        We may use third-party service providers to assist in operating our Service. These providers have access to Your information only to perform tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                    </p>
                    <p class="text-slate-600">
                        We do NOT sell, trade, or otherwise transfer Your personal information to outside parties. We do NOT use Your information for targeted advertising.
                    </p>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">10. CHILDREN'S PRIVACY</h2>
                    <p class="text-slate-600">
                        Our Service is not intended for use by individuals under the age of 18 (or the age of majority in Your jurisdiction). We do not knowingly collect personal information from children. If We become aware that We have collected personal information from a child, We will take steps to delete such information promptly.
                    </p>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">11. CHANGES TO THIS PRIVACY POLICY</h2>
                    <p class="text-slate-600">
                        We may update this Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">12. CONTACT INFORMATION</h2>
                    <p class="text-slate-600 mb-4">
                        If You have any questions about this Privacy Policy, wish to exercise Your data protection rights, or wish to file a complaint, please contact us at:
                    </p>
                    <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p class="text-slate-600">
                            <strong>Email:</strong> <a href="mailto:support@contractchecker.net" class="text-electric-blue hover:underline">support@contractchecker.net</a>
                        </p>
                        <p class="text-slate-600 mt-2">
                            <strong>Data Protection Officer:</strong> We have not appointed a dedicated DPO as our processing activities do not meet the threshold requiring one under GDPR Article 37.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 class="font-serif text-xl font-bold text-deep-justice mb-4">13. REGULATORY SUPERVISORY AUTHORITIES</h2>
                    <p class="text-slate-600 mb-4">If You are located in the following jurisdictions, You have the right to lodge a complaint with the relevant supervisory authority:</p>
                    <ul class="list-disc pl-6 space-y-2 text-slate-600">
                        <li><strong>EU:</strong> Your local Data Protection Authority or the Irish Data Protection Commission (for our primary establishment)</li>
                        <li><strong>UK:</strong> Information Commissioner's Office (ICO)</li>
                        <li><strong>Canada:</strong> Office of the Privacy Commissioner of Canada or Your provincial privacy authority</li>
                        <li><strong>Australia:</strong> Office of the Australian Information Commissioner (OAIC)</li>
                    </ul>
                </section>
            </div>

            <div class="mt-12 pt-8 border-t border-slate-200">
                <a href="/" class="inline-flex items-center gap-2 text-electric-blue font-medium hover:underline">
                    <ArrowLeft class="h-4 w-4" />
                    Back to ContractChecker.net
                </a>
            </div>
        </div>
    </div>

    <footer class="bg-slate-900 py-8 px-4 border-t border-slate-800 mt-12">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-2">
                    <img
                        src="https://storage.contractchecker.net/header.webp"
                        alt="ContractChecker Logo"
                        class="h-6 w-auto opacity-90"
                    />
                </div>
                <p class="text-slate-500 text-sm">
                    &copy; 2026 ContractChecker.net. All rights reserved.
                </p>
                <div class="flex gap-6 text-sm">
                    <a href="/terms" class="text-slate-400 hover:text-white transition-colors">Terms</a>
                    <a href="/privacy" class="text-slate-400 hover:text-white transition-colors">Privacy</a>
                    <a href="mailto:support@contractchecker.net" class="text-slate-400 hover:text-white transition-colors">Contact</a>
                </div>
            </div>
        </div>
    </footer>
</div>

<style>
    .text-electric-blue { color: #2563eb; }
    .bg-electric-blue { background-color: #2563eb; }
    .text-deep-justice { color: #0f172a; }
    .bg-deep-justice { background-color: #0f172a; }
    .text-verdict-green { color: #059669; }
    .bg-verdict-green { background-color: #059669; }
    .text-gavel-red { color: #DC2626; }
    .bg-gavel-red { background-color: #DC2626; }
    .list-circle { list-style-type: circle; }
</style>
