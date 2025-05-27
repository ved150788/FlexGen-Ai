"""
API routes for the threat intelligence platform
"""

from flask import Blueprint, request, jsonify, current_app
from app.tools.threat_intel_platform.app.models.schema import IOC, FeedRun
from app.tools.threat_intel_platform.app.models import get_stats
from app.tools.threat_intel_platform.app import db
from datetime import datetime, timedelta
from sqlalchemy import desc, or_, func, case, and_
import json

# Create the API blueprint
api = Blueprint('api', __name__)

@api.route('/status')
def status():
    """API status endpoint"""
    return jsonify({
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    })

@api.route('/stats')
def stats():
    """Get platform statistics"""
    return jsonify(get_stats())

@api.route('/dashboard')
def dashboard():
    """Get dashboard statistics data"""
    try:
        # Calculate total threats
        total_threats = db.session.query(func.count(IOC.id)).scalar() or 0
        
        # Calculate new threats in last 24h
        yesterday = datetime.utcnow() - timedelta(days=1)
        new_threats = db.session.query(func.count(IOC.id)).filter(
            IOC.created_at >= yesterday
        ).scalar() or 0
        
        # Get top domains
        top_domains_query = db.session.query(
            IOC.value, 
            func.count(IOC.id).label('count')
        ).filter(
            IOC.type == 'domain'
        ).group_by(
            IOC.value
        ).order_by(
            desc('count')
        ).limit(5)
        
        top_domains = [
            {"domain": domain, "count": count} 
            for domain, count in top_domains_query
        ]
        
        # Get top IPs
        top_ips_query = db.session.query(
            IOC.value, 
            func.count(IOC.id).label('count')
        ).filter(
            IOC.type == 'ip'
        ).group_by(
            IOC.value
        ).order_by(
            desc('count')
        ).limit(5)
        
        top_ips = [
            {"ip": ip, "count": count} 
            for ip, count in top_ips_query
        ]
        
        # Get threats by type
        threats_by_type_query = db.session.query(
            IOC.type, 
            func.count(IOC.id).label('count')
        ).group_by(
            IOC.type
        ).order_by(
            desc('count')
        )
        
        threats_by_type = [
            {"type": type_, "count": count} 
            for type_, count in threats_by_type_query
        ]
        
        return jsonify({
            "totalThreats": total_threats,
            "newThreats": new_threats,
            "topDomains": top_domains,
            "topIPs": top_ips,
            "threatsByType": threats_by_type
        })
    except Exception as e:
        current_app.logger.error(f"Dashboard stats error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An error occurred while generating dashboard statistics"
        }), 500

@api.route('/iocs')
def get_iocs():
    """Get all IOCs with filtering options"""
    try:
        # Parse filter parameters
        type_filter = request.args.get('type')
        source_filter = request.args.get('source')
        time_range = request.args.get('timeRange')
        
        # Build query
        query = db.session.query(IOC)
        
        # Apply filters
        if type_filter and type_filter != 'all':
            query = query.filter(IOC.type == type_filter)
            
        if source_filter and source_filter != 'all':
            query = query.filter(IOC.source == source_filter)
            
        if time_range and time_range != 'all':
            # Convert time range to timedelta
            if time_range == '24h':
                delta = timedelta(hours=24)
            elif time_range == '7d':
                delta = timedelta(days=7)
            elif time_range == '30d':
                delta = timedelta(days=30)
            elif time_range == '90d':
                delta = timedelta(days=90)
            else:
                delta = None
                
            if delta:
                cutoff_time = datetime.utcnow() - delta
                query = query.filter(IOC.last_seen >= cutoff_time)
        
        # Get results
        iocs = query.order_by(desc(IOC.last_seen)).limit(100).all()
        
        # Prepare results
        results = []
        for ioc in iocs:
            # Parse tags from JSON if available
            tags = []
            if ioc.tags:
                try:
                    tags = json.loads(ioc.tags)
                except:
                    # If tags is not valid JSON, treat it as a comma-separated string
                    tags = [tag.strip() for tag in ioc.tags.split(',') if tag.strip()]
            
            results.append({
                "indicator": ioc.value,
                "type": ioc.type,
                "threatScore": ioc.confidence_score,
                "source": ioc.source,
                "firstSeen": ioc.created_at.isoformat() if ioc.created_at else None,
                "lastSeen": ioc.last_seen.isoformat() if ioc.last_seen else None,
                "tags": tags,
                "sourceUrl": ioc.reference_link,
                "sampleText": ioc.description
            })
        
        return jsonify({
            "status": "success",
            "results": results
        })
    except Exception as e:
        current_app.logger.error(f"IOC listing error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An error occurred while retrieving IOCs"
        }), 500

@api.route('/search')
def search():
    """Search for threat intelligence based on indicators"""
    try:
        query = request.args.get('query', '')
        if not query:
            return jsonify({
                "status": "error",
                "message": "No query parameter provided"
            }), 400
        
        # Search for IOCs
        search_query = f"%{query}%"
        results = db.session.query(IOC).filter(
            or_(
                IOC.value.ilike(search_query),
                IOC.type.ilike(search_query),
                IOC.source.ilike(search_query)
            )
        ).limit(100).all()
        
        # Prepare results with extra fields
        formatted_results = []
        for ioc in results:
            # Parse tags from JSON if available
            tags = []
            if ioc.tags:
                try:
                    tags = json.loads(ioc.tags)
                except:
                    # If tags is not valid JSON, treat it as a comma-separated string
                    tags = [tag.strip() for tag in ioc.tags.split(',') if tag.strip()]
                    
            formatted_results.append({
                "indicator": ioc.value,
                "type": ioc.type,
                "threatScore": ioc.confidence_score,
                "source": ioc.source,
                "firstSeen": ioc.created_at.isoformat() if ioc.created_at else None,
                "lastSeen": ioc.last_seen.isoformat() if ioc.last_seen else None,
                "tags": tags,
                "sourceUrl": ioc.reference_link,
                "sampleText": ioc.description
            })
        
        response_data = {
            "status": "success",
            "results": formatted_results
        }
        
        return jsonify(response_data)
    except Exception as e:
        current_app.logger.error(f"Search error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An error occurred during the search operation"
        }), 500

@api.route('/crawlers')
def crawlers():
    """Get crawler information"""
    try:
        from app.tools.threat_intel_platform.app.crawlers.config import crawler_config
        
        crawler_config.discover_crawlers()
        configs = crawler_config.get_all_configurations()
        
        return jsonify({
            "status": "success",
            "crawlers": configs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api.route('/crawlers/status')
def crawler_status():
    """Get crawler status information"""
    try:
        # Get latest feed runs
        feed_runs = db.session.query(FeedRun).order_by(
            FeedRun.feed_name, desc(FeedRun.start_time)
        ).all()
        
        # Group by feed name
        status_by_feed = {}
        for run in feed_runs:
            if run.feed_name not in status_by_feed:
                status_by_feed[run.feed_name] = {
                    "last_run": run.start_time.isoformat() if run.start_time else None,
                    "status": run.status,
                    "items_processed": run.items_processed,
                    "items_added": run.items_added,
                    "items_updated": run.items_updated,
                    "error": run.error_message
                }
        
        return jsonify({
            "status": "success",
            "crawler_status": status_by_feed
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api.route('/taxii/status')
def taxii_status():
    """Get status of TAXII intelligence sources"""
    try:
        from app.tools.threat_intel_platform.app.utils.taxii_client import get_taxii_servers
        
        # Get TAXII server configurations
        taxii_servers = get_taxii_servers()
        
        # Get latest feed runs related to TAXII
        feed_runs = db.session.query(FeedRun).filter(
            FeedRun.feed_name == "taxii_client"
        ).order_by(
            desc(FeedRun.start_time)
        ).limit(10).all()
        
        # Count IOCs from each TAXII source
        taxii_sources = []
        for server in taxii_servers:
            source_name = server.get('name')
            count = db.session.query(func.count(IOC.id)).filter(
                IOC.source == source_name
            ).scalar() or 0
            
            taxii_sources.append({
                "name": source_name,
                "url": server.get('url'),
                "collection": server.get('collection_name'),
                "iocCount": count
            })
        
        return jsonify({
            "status": "success",
            "taxiSources": taxii_sources,
            "recentRuns": [
                {
                    "timestamp": run.start_time.isoformat() if run.start_time else None,
                    "status": run.status,
                    "itemsAdded": run.items_added or 0,
                    "itemsUpdated": run.items_updated or 0,
                    "error": run.error_message
                }
                for run in feed_runs
            ]
        })
    except Exception as e:
        current_app.logger.error(f"TAXII status error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An error occurred while retrieving TAXII status"
        }), 500

@api.route('/taxii/fetch', methods=['POST'])
def taxii_fetch():
    """Manually trigger TAXII intelligence fetch"""
    try:
        from app.tools.threat_intel_platform.app.utils.taxii_client import fetch_and_store_intelligence
        
        # Record start time
        start_time = datetime.utcnow()
        
        # Fetch intelligence
        total_iocs = fetch_and_store_intelligence()
        
        # Record end time
        end_time = datetime.utcnow()
        
        # Record the run
        feed_run = FeedRun(
            feed_name="taxii_client",
            start_time=start_time,
            end_time=end_time,
            status='completed',
            items_added=total_iocs
        )
        db.session.add(feed_run)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": f"Successfully fetched intelligence from TAXII servers",
            "addedIocs": total_iocs,
            "duration": (end_time - start_time).total_seconds()
        })
    except Exception as e:
        current_app.logger.error(f"TAXII fetch error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred while fetching TAXII intelligence: {str(e)}"
        }), 500 