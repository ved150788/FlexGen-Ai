export interface Service {
	id: number;
	title: string;
	slug: string;
	description: string;
	icon: string;
	longDescription: string;
	features: string[];
	benefits: string[];
	approach: string;
	caseStudies: {
		title: string;
		description: string;
		result: string;
	}[];
}

export const services: Service[] = [
	{
		id: 1,
		title: "Threat Intelligence",
		slug: "threat-intelligence",
		description:
			"Real-time threat monitoring and analysis powered by advanced AI to identify and neutralize cyber threats before they impact your business.",
		icon: "/icons/threat.svg",
		longDescription:
			"Our AI-powered threat intelligence platform continuously monitors global threat landscapes to provide actionable insights and early warnings of potential cyber attacks. We analyze threat patterns and vulnerabilities specific to your industry to create customized protection strategies.",
		features: [
			"Global threat intelligence collection and analysis",
			"Industry-specific threat monitoring",
			"Real-time alerting and notifications",
			"Threat intelligence integration with security tools",
			"Regular threat landscape reports and briefings",
		],
		benefits: [
			"Early detection of emerging threats targeting your industry",
			"Prioritize security efforts based on actual threat data",
			"Reduce dwell time of threats in your environment",
			"Make informed security decisions with actionable intelligence",
			"Stay ahead of evolving threat actor techniques",
		],
		approach:
			"Our threat intelligence approach combines automated collection from thousands of sources with expert human analysis to deliver actionable insights specific to your organization. We monitor the clear, deep, and dark web for mentions of your brand, industry, and technologies. Our analysts evaluate and contextualize threats to provide intelligence that is relevant to your specific risk profile, enabling you to make informed security decisions and prioritize your defenses against the most likely attack vectors.",
		caseStudies: [
			{
				title: "Financial Institution Prevents Targeted Attack",
				description:
					"Our threat intelligence team identified chatter about a planned attack against our client's banking infrastructure two weeks before it occurred.",
				result:
					"Security team implemented defensive measures that successfully blocked all attack attempts with zero service disruption.",
			},
			{
				title: "Healthcare Provider Protects Patient Data",
				description:
					"Monitoring identified leaked credentials on dark web marketplaces that could have led to unauthorized access to critical systems.",
				result:
					"Preventative password resets and enhanced authentication requirements prevented potential data breach.",
			},
		],
	},
	{
		id: 2,
		title: "Vulnerability Assessment",
		slug: "vulnerability-assessment",
		description:
			"Comprehensive scanning and assessment to identify security gaps in your infrastructure, applications, and networks.",
		icon: "/icons/risk.svg",
		longDescription:
			"Our vulnerability assessment service provides in-depth analysis of your digital assets to identify potential security weaknesses. We combine automated scanning with expert manual verification to deliver actionable results with minimal false positives.",
		features: [
			"Infrastructure and network scanning",
			"Web application security testing",
			"API security assessment",
			"Cloud configuration review",
			"Compliance gap analysis",
		],
		benefits: [
			"Identify security gaps before attackers",
			"Prioritize remediation efforts efficiently",
			"Meet regulatory compliance requirements",
			"Reduce risk of data breaches",
			"Establish security baseline for future comparisons",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 3,
		title: "Penetration Testing",
		slug: "pentesting",
		description:
			"Ethical hacking and security assessments performed by certified security professionals to identify vulnerabilities in your systems.",
		icon: "/icons/pentest.svg",
		longDescription:
			"Our Pentesting as a Service offering combines human expertise with AI-assisted tools to simulate real-world attacks on your digital infrastructure. We identify vulnerabilities and provide clear remediation guidance to strengthen your security posture.",
		features: [
			"Network penetration testing",
			"Web application pentesting",
			"Social engineering simulations",
			"Wireless network security assessment",
			"Red team operations",
		],
		benefits: [
			"Validate security controls effectiveness",
			"Identify complex attack vectors",
			"Test security team response capabilities",
			"Meet compliance requirements (PCI-DSS, HIPAA, etc.)",
			"Build customer trust through security verification",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 4,
		title: "Security Training",
		slug: "security-training",
		description:
			"Comprehensive cybersecurity training programs to educate employees on best practices and threat awareness.",
		icon: "/icons/training.svg",
		longDescription:
			"Our adaptive security training programs help build a strong security culture within your organization. We offer personalized learning paths based on role requirements and current threat landscapes to ensure relevant and effective training.",
		features: [
			"Phishing simulation exercises",
			"Role-based security training",
			"Interactive learning modules",
			"Security awareness campaigns",
			"Compliance-specific education",
		],
		benefits: [
			"Reduce human-error related incidents by up to 90%",
			"Build organization-wide security awareness",
			"Meet compliance training requirements",
			"Increase reporting of suspicious activities",
			"Measurable improvement in security posture",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 5,
		title: "Incident Response",
		slug: "incident-response",
		description:
			"Rapid response and containment services for security incidents, with full analysis and recovery support.",
		icon: "/icons/incident.svg",
		longDescription:
			"Our incident response team provides 24/7 support to contain, investigate, and remediate security incidents. We help minimize damage, recover systems, and implement lessons learned to prevent future occurrences.",
		features: [
			"24/7 incident response coverage",
			"Digital forensics investigation",
			"Malware analysis and reverse engineering",
			"System recovery assistance",
			"Post-incident analysis and reporting",
		],
		benefits: [
			"Minimize breach impact and costs",
			"Faster recovery from security incidents",
			"Evidence preservation for legal proceedings",
			"Continuous improvement of security controls",
			"Expert guidance during crisis situations",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 6,
		title: "AI Security Solutions",
		slug: "ai-security",
		description:
			"Cutting-edge AI and machine learning security solutions to protect against sophisticated cyber threats and zero-day exploits.",
		icon: "/icons/ai.svg",
		longDescription:
			"Our proprietary AI security platform leverages advanced machine learning algorithms to detect anomalies and predict potential security incidents before they occur. We help organizations stay ahead of emerging threats with adaptive security measures.",
		features: [
			"Behavioral analysis and anomaly detection",
			"Predictive threat modeling",
			"Autonomous security response",
			"Zero-day threat protection",
			"Continuous security posture assessment",
		],
		benefits: [
			"Proactive rather than reactive security",
			"Adaptation to evolving threat landscapes",
			"Reduced security team alert fatigue",
			"Protection against unknown threats",
			"Accelerated incident detection and response",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 7,
		title: "Compliance Audit",
		slug: "compliance-audit",
		description:
			"Ensure adherence to industry regulations and standards with comprehensive audits.",
		icon: "/icons/compliance.svg",
		longDescription:
			"Stay ahead of regulatory requirements with our Compliance Audit service. We help organizations navigate complex compliance landscapes including GDPR, HIPAA, PCI DSS, SOC 2, and ISO 27001. Our expert auditors conduct thorough assessments of your security controls, policies, and procedures to identify compliance gaps.",
		features: [
			"Regulatory compliance assessment",
			"Gap analysis and remediation planning",
			"Policy and procedure review",
			"Continuous compliance monitoring",
			"Audit preparation assistance",
		],
		benefits: [
			"Minimize compliance risk and potential penalties",
			"Build trust with customers and partners",
			"Streamline regulatory reporting processes",
			"Identify and resolve compliance issues proactively",
			"Maintain ongoing compliance with evolving regulations",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 8,
		title: "Security Posture Management",
		slug: "security-posture-management",
		description:
			"Maintain optimal security configuration across all assets and environments.",
		icon: "/icons/posture.svg",
		longDescription:
			"FlexGen.ai's Security Posture Management service provides continuous visibility into your organization's security stance. We help you maintain robust security configurations across cloud environments, on-premises infrastructure, and endpoints. Our solution automates security posture assessment, identifies misconfigurations and drift, ensures policy compliance, and tracks security improvements over time.",
		features: [
			"Continuous security posture monitoring",
			"Automated configuration assessment",
			"Misconfigurations and drift detection",
			"Cloud security posture management",
			"Executive-level security metrics and reporting",
		],
		benefits: [
			"Reduce attack surface through consistent security controls",
			"Prioritize security efforts based on risk exposure",
			"Improve security team efficiency with automation",
			"Demonstrate security improvements with measurable metrics",
			"Align security controls with business objectives",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 9,
		title: "Security Consulting",
		slug: "security-consulting",
		description:
			"Expert guidance and strategic security planning for your organization.",
		icon: "/icons/consulting.svg",
		longDescription:
			"Our Security Consulting services provide expert guidance tailored to your organization's specific challenges and objectives. Our seasoned consultants work with you to develop comprehensive security strategies that align with your business goals. We offer services including security program development, architecture review, risk management frameworks, and security roadmap creation.",
		features: [
			"Security program development",
			"Architecture review and design",
			"Risk management framework implementation",
			"Security roadmap creation",
			"Executive advisory services",
		],
		benefits: [
			"Align security strategy with business objectives",
			"Optimize security investments for maximum impact",
			"Navigate complex security decisions with expert guidance",
			"Build mature security capabilities over time",
			"Translate technical security concepts for business leadership",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 10,
		title: "DevSecOps Implementation",
		slug: "devsecops-implementation",
		description:
			"Integrate security throughout your development lifecycle for safer applications.",
		icon: "/icons/devsecops.svg",
		longDescription:
			"Our DevSecOps Implementation service helps organizations embed security throughout the software development lifecycle. We work with your development and operations teams to implement automated security testing, vulnerability scanning, and policy compliance checks within your CI/CD pipelines.",
		features: [
			"CI/CD pipeline security integration",
			"Automated security testing setup",
			"Developer security training",
			"Security policy as code implementation",
			"Continuous vulnerability management",
		],
		benefits: [
			"Detect and fix security issues earlier in development",
			"Reduce remediation costs with shift-left security",
			"Balance development velocity with security requirements",
			"Create consistent security standards across teams",
			"Improve collaboration between development and security teams",
		],
		approach: "",
		caseStudies: [],
	},
	{
		id: 11,
		title: "Cloud Security",
		slug: "cloud-security",
		description:
			"Secure your cloud infrastructure and applications across all environments.",
		icon: "/icons/cloud.svg",
		longDescription:
			"Our Cloud Security service provides comprehensive protection for your cloud environments across AWS, Azure, Google Cloud, and multi-cloud deployments. We implement robust security controls tailored to cloud architectures, including identity and access management, encryption strategies, network security, and continuous compliance monitoring.",
		features: [
			"Cloud environment security assessment",
			"Identity and access management optimization",
			"Data encryption and protection",
			"Cloud network security controls",
			"Serverless and container security",
		],
		benefits: [
			"Secure cloud environments without hindering innovation",
			"Maintain compliance in fast-changing cloud environments",
			"Prevent data breaches and unauthorized access",
			"Optimize cloud security spending",
			"Enable safe adoption of new cloud services",
		],
		approach: "",
		caseStudies: [],
	},
];
