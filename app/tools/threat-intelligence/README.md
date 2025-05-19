# Threat Intelligence Platform

A real-time threat intelligence platform that aggregates data from multiple sources to provide actionable insights about cybersecurity threats.

## Features

- Real-time data collection from multiple threat intelligence sources
- Threat indicator visualization and analysis
- Campaign tracking and monitoring
- Customizable alerts and notifications
- Trend analysis of emerging threats
- Geographic and industry-specific threat mapping

## Setup for Real-Time Data

The platform is designed to connect to multiple threat intelligence sources using their APIs. To set up real-time data:

### 1. Create API accounts

Register for API access with the following threat intelligence providers:

- [VirusTotal](https://developers.virustotal.com/reference)
- [AlienVault OTX](https://otx.alienvault.com/api)
- [MISP](https://www.misp-project.org/documentation/)

### 2. Set up environment variables

Create a `.env.local` file in the root directory with your API keys:

```
# Threat Intelligence API Keys
VIRUSTOTAL_API_KEY=your_virustotal_api_key
OTX_API_KEY=your_otx_api_key
MISP_API_KEY=your_misp_api_key

# TAXII Server Credentials (if applicable)
TAXII_USERNAME=your_taxii_username
TAXII_PASSWORD=your_taxii_password
```

### 3. Configure STIX/TAXII feeds (optional)

If you have access to STIX/TAXII feeds, update the TAXII server configuration in `app/tools/threat-intelligence/stix-connector.ts`:

```typescript
export const taxiiConfig: TaxiiConfig = {
	baseUrl: "https://your-taxii-server.com/",
	username: process.env.TAXII_USERNAME,
	password: process.env.TAXII_PASSWORD,
	version: "2.1",
};
```

## Implementation Details

The platform uses several modules to collect and process threat intelligence:

1. **API Module** (`api.ts`): Centralizes API connections to commercial threat intelligence sources
2. **STIX/TAXII Connector** (`stix-connector.ts`): Implements STIX/TAXII protocols for standardized threat intelligence exchange
3. **Dashboard Page** (`page.tsx`): Visualizes and presents the aggregated threat intelligence

## Extending the Platform

### Adding a New Data Source

To add a new threat intelligence source:

1. Add the API configuration in `api.ts`
2. Create a new fetch function for the specific source
3. Update the `aggregateIntelligence()` function to include the new source
4. Update the data transformation logic to handle the specific format from the new source

### Adding New Visualizations

To add new visualizations:

1. Update the Dashboard interface in `page.tsx` to include the new data type
2. Create a new rendering function or component for the visualization
3. Add the new visualization to the dashboard rendering logic

## Fallback to Sample Data

The platform includes a fallback mechanism to sample data if the API connections fail. This ensures that the UI remains functional even when external data sources are unavailable.

## License

This platform is for internal use only. All rights reserved.
