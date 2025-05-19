"""
Report generation for the API Fuzzer
"""

import json
import logging
import os
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
import time

logger = logging.getLogger("api_fuzzer")

class IssueSeverity(str, Enum):
    """Severity levels for issues"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

@dataclass
class Issue:
    """Represents a detected issue during fuzzing"""
    title: str
    description: str
    endpoint: str
    method: str
    severity: IssueSeverity
    request_data: Dict[str, Any]
    response_data: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert issue to dictionary"""
        return {
            "title": self.title,
            "description": self.description,
            "endpoint": self.endpoint,
            "method": self.method,
            "severity": self.severity,
            "request_data": self.request_data,
            "response_data": self.response_data,
            "timestamp": self.timestamp
        }

@dataclass
class FuzzingReport:
    """Report containing all findings from the fuzzing run"""
    start_time: str = field(default_factory=lambda: datetime.now().isoformat())
    end_time: Optional[str] = None
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    issues: List[Issue] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add_issue(self, issue: Issue) -> None:
        """Add an issue to the report"""
        self.issues.append(issue)
        logger.info(f"Issue found: {issue.title} ({issue.severity}) - {issue.endpoint}")
    
    def set_complete(self) -> None:
        """Mark the report as complete by setting the end time"""
        self.end_time = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert report to dictionary"""
        return {
            "start_time": self.start_time,
            "end_time": self.end_time or datetime.now().isoformat(),
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "issues": [issue.to_dict() for issue in self.issues],
            "metadata": self.metadata
        }
    
    def save(self, output_path: Union[str, Path]) -> None:
        """Save the report to a file"""
        if self.end_time is None:
            self.set_complete()
        
        output_path = Path(output_path)
        
        # Save JSON report
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2)
        
        # Also generate HTML and Markdown reports
        if output_path.suffix.lower() == '.json':
            base_path = output_path.parent / output_path.stem
            markdown_path = f"{base_path}.md"
            html_path = f"{base_path}.html"
            
            # Generate markdown report
            self.save_markdown(markdown_path)
            
            # Generate HTML report
            self.save_html(html_path)
            
            logger.info(f"Report saved to {output_path} (with HTML and Markdown versions)")
        else:
            logger.info(f"Report saved to {output_path}")
    
    def summary(self) -> str:
        """Generate a text summary of the report"""
        duration = "Unknown"
        if self.end_time and self.start_time:
            end_dt = datetime.fromisoformat(self.end_time)
            start_dt = datetime.fromisoformat(self.start_time)
            duration = str(end_dt - start_dt)
        
        issues_by_severity = {}
        for issue in self.issues:
            if issue.severity not in issues_by_severity:
                issues_by_severity[issue.severity] = 0
            issues_by_severity[issue.severity] += 1
        
        summary_text = [
            "API Fuzzing Report Summary",
            "==========================",
            f"Duration: {duration}",
            f"Total Requests: {self.total_requests}",
            f"Successful Requests: {self.successful_requests}",
            f"Failed Requests: {self.failed_requests}",
            f"Total Issues Found: {len(self.issues)}",
            "",
            "Issues by Severity:",
        ]
        
        for severity in IssueSeverity:
            count = issues_by_severity.get(severity, 0)
            summary_text.append(f"  {severity.upper()}: {count}")
        
        return "\n".join(summary_text)
    
    def save_markdown(self, output_path: Union[str, Path]) -> None:
        """Save the report as a Markdown file"""
        duration = "Unknown"
        if self.end_time and self.start_time:
            end_dt = datetime.fromisoformat(self.end_time)
            start_dt = datetime.fromisoformat(self.start_time)
            duration = str(end_dt - start_dt)
        
        # Prepare output content
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Organize issues by severity
        issues_by_severity = {}
        for issue in self.issues:
            if issue.severity not in issues_by_severity:
                issues_by_severity[issue.severity] = []
            issues_by_severity[issue.severity].append(issue)
        
        # Sort severities from most to least critical
        severity_order = [
            IssueSeverity.CRITICAL,
            IssueSeverity.HIGH,
            IssueSeverity.MEDIUM,
            IssueSeverity.LOW,
            IssueSeverity.INFO
        ]
        
        # Create markdown content
        md_content = [
            "# API Fuzzing Report",
            f"Generated: {timestamp}",
            "",
            "## Summary",
            "",
            f"- **API Type**: {self.metadata.get('spec_type', 'Unknown')}",
            f"- **Specification**: {self.metadata.get('spec_path', 'Unknown')}",
            f"- **Duration**: {duration}",
            f"- **Total Requests**: {self.total_requests}",
            f"- **Successful Requests**: {self.successful_requests}",
            f"- **Failed Requests**: {self.failed_requests}",
            f"- **Issues Found**: {len(self.issues)}",
            "",
            "## Issues by Severity",
            "",
        ]
        
        # Add issue counts by severity
        for severity in severity_order:
            count = len(issues_by_severity.get(severity, []))
            if count > 0:
                md_content.append(f"- **{severity.upper()}**: {count}")
        
        # Add detailed issue sections
        md_content.append("\n## Detailed Issues\n")
        
        for severity in severity_order:
            severity_issues = issues_by_severity.get(severity, [])
            if not severity_issues:
                continue
            
            md_content.append(f"### {severity.upper()} Severity Issues\n")
            
            for i, issue in enumerate(severity_issues, 1):
                md_content.append(f"#### {i}. {issue.title}")
                md_content.append(f"- **Endpoint**: {issue.method} {issue.endpoint}")
                md_content.append(f"- **Description**: {issue.description}")
                md_content.append(f"- **Request Data**: ```json\n{json.dumps(issue.request_data, indent=2)}\n```")
                
                # Limit the response data size in Markdown to avoid huge files
                response_str = json.dumps(issue.response_data, indent=2)
                if len(response_str) > 1000:
                    response_str = response_str[:1000] + "...(truncated)"
                md_content.append(f"- **Response Data**: ```json\n{response_str}\n```")
                md_content.append("")
        
        # Write content to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(md_content))
        
        logger.info(f"Markdown report saved to {output_path}")
    
    def save_html(self, output_path: Union[str, Path]) -> None:
        """Save the report as an HTML file"""
        # Convert the report to a dictionary
        report_data = self.to_dict()
        
        duration = "Unknown"
        if self.end_time and self.start_time:
            end_dt = datetime.fromisoformat(self.end_time)
            start_dt = datetime.fromisoformat(self.start_time)
            duration = str(end_dt - start_dt)
        
        # Simple HTML template
        html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Fuzzing Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3, h4 {
            color: #2c3e50;
        }
        .summary {
            background-color: #f8f9fa;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #6c757d;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .summary-label {
            font-weight: bold;
            flex: 0 0 40%;
        }
        .severity-info { color: #0dcaf0; }
        .severity-low { color: #20c997; }
        .severity-medium { color: #fd7e14; }
        .severity-high { color: #dc3545; }
        .severity-critical { color: #6f42c1; }
        .issue {
            margin-bottom: 30px;
            padding: 15px;
            border-radius: 4px;
            background-color: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,.1);
        }
        .issue-title {
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 15px;
            color: #333;
        }
        .endpoint {
            font-family: monospace;
            background-color: #f8f9fa;
            padding: 2px 4px;
            border-radius: 2px;
        }
        .method {
            font-weight: bold;
        }
        .method-GET { color: #0d6efd; }
        .method-POST { color: #198754; }
        .method-PUT { color: #fd7e14; }
        .method-DELETE { color: #dc3545; }
        .method-PATCH { color: #6f42c1; }
        .data-container {
            background-color: #f8f9fa;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            overflow-x: auto;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 13px;
        }
        .badge {
            display: inline-block;
            padding: 3px 7px;
            font-size: 12px;
            font-weight: bold;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 10px;
            color: white;
        }
        .badge-info { background-color: #0dcaf0; }
        .badge-low { background-color: #20c997; }
        .badge-medium { background-color: #fd7e14; }
        .badge-high { background-color: #dc3545; }
        .badge-critical { background-color: #6f42c1; }
        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            flex: 1;
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,.1);
            text-align: center;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
        }
        .stat-label {
            color: #6c757d;
            font-size: 14px;
        }
        .no-issues {
            text-align: center;
            padding: 40px;
            background-color: #f8f9fa;
            border-radius: 4px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <h1>API Fuzzing Report</h1>
    <p>Generated: {timestamp}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="summary-row">
            <span class="summary-label">API Type:</span>
            <span>{spec_type}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Specification:</span>
            <span>{spec_path}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Duration:</span>
            <span>{duration}</span>
        </div>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-label">Total Requests</div>
            <div class="stat-value">{total_requests}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Successful</div>
            <div class="stat-value">{successful_requests}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Failed</div>
            <div class="stat-value">{failed_requests}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Issues Found</div>
            <div class="stat-value">{issue_count}</div>
        </div>
    </div>
    
    <h2>Issues by Severity</h2>
    
    {severity_counts}
    
    <h2>Detailed Issues</h2>
    
    {issues_html}
    
    <script>
        // Add code for expanding/collapsing sections if needed
    </script>
</body>
</html>
"""
        
        # Generate severity badge HTML
        severity_counts_html = []
        for severity in IssueSeverity:
            count = len([i for i in self.issues if i.severity == severity])
            if count > 0:
                severity_counts_html.append(f'<span class="badge badge-{severity}">{ severity.upper()}: {count}</span>')
        
        # Generate issues HTML
        if self.issues:
            issues_html = []
            
            # Group issues by severity
            issues_by_severity = {}
            for issue in self.issues:
                if issue.severity not in issues_by_severity:
                    issues_by_severity[issue.severity] = []
                issues_by_severity[issue.severity].append(issue)
            
            # Sort severities from most to least critical
            severity_order = [
                IssueSeverity.CRITICAL,
                IssueSeverity.HIGH,
                IssueSeverity.MEDIUM,
                IssueSeverity.LOW,
                IssueSeverity.INFO
            ]
            
            for severity in severity_order:
                severity_issues = issues_by_severity.get(severity, [])
                if not severity_issues:
                    continue
                
                issues_html.append(f'<h3 class="severity-{severity}">{severity.upper()} Severity Issues</h3>')
                
                for issue in severity_issues:
                    method_class = f"method-{issue.method}" if issue.method in ["GET", "POST", "PUT", "DELETE", "PATCH"] else ""
                    
                    # Format request and response data as JSON
                    request_json = json.dumps(issue.request_data, indent=2)
                    
                    # Limit the response data size in HTML to avoid huge files
                    response_json = json.dumps(issue.response_data, indent=2)
                    if len(response_json) > 2000:
                        response_json = response_json[:2000] + "...(truncated)"
                    
                    issues_html.append(f'''
                    <div class="issue">
                        <h4 class="issue-title">{issue.title} <span class="badge badge-{issue.severity}">{issue.severity.upper()}</span></h4>
                        <p><strong>Endpoint:</strong> <span class="method {method_class}">{issue.method}</span> <span class="endpoint">{issue.endpoint}</span></p>
                        <p><strong>Description:</strong> {issue.description}</p>
                        <div>
                            <strong>Request Data:</strong>
                            <div class="data-container">
                                <pre>{request_json}</pre>
                            </div>
                        </div>
                        <div>
                            <strong>Response Data:</strong>
                            <div class="data-container">
                                <pre>{response_json}</pre>
                            </div>
                        </div>
                    </div>
                    ''')
            
            issues_html = "\n".join(issues_html)
        else:
            issues_html = '<div class="no-issues">No issues found</div>'
        
        # Fill in the template
        html_content = html_template.format(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            spec_type=self.metadata.get('spec_type', 'Unknown'),
            spec_path=self.metadata.get('spec_path', 'Unknown'),
            duration=duration,
            total_requests=self.total_requests,
            successful_requests=self.successful_requests,
            failed_requests=self.failed_requests,
            issue_count=len(self.issues),
            severity_counts=" ".join(severity_counts_html),
            issues_html=issues_html
        )
        
        # Write content to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        logger.info(f"HTML report saved to {output_path}") 