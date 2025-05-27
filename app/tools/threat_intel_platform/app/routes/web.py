"""
Web routes for the threat intelligence platform
"""

from flask import Blueprint, render_template, jsonify, request, current_app
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import requests
import json
import os

from .. import db
from ..models import get_stats
from ..models.schema import (
    IOC, FeedRun, ThreatActor, Campaign, Vulnerability, Relationship, Event
)

# Create the web blueprint
web = Blueprint('web', __name__)

def fetch_alienvault_dashboard_data():
    """
    Fetch real-time dashboard data from AlienVault OTX
    """
    api_key = os.environ.get('ALIENVAULT_API_KEY')
    if not api_key:
        current_app.logger.warning("AlienVault API key not provided for real-time data")
        return None
    
    try:
        headers = {
            'X-OTX-API-KEY': api_key,
            'User-Agent': 'FlexGenThreatIntel/1.0'
        }
        
        # Get pulses modified in the last 24 hours
        since = datetime.now() - timedelta(hours=24)
        params = {
            'modified_since': since.isoformat()
        }
        
        response = requests.get("https://otx.alienvault.com/api/v1/pulses/subscribed", 
                               headers=headers, params=params)
        
        if response.status_code != 200:
            current_app.logger.error(f"Failed to fetch AlienVault data: {response.status_code}")
            return None
        
        data = response.json()
        
        # Extract and return meaningful stats
        return {
            'recent_pulses': len(data.get('results', [])),
            'pulse_data': data.get('results', [])[:5]  # Get the 5 most recent pulses
        }
    except Exception as e:
        current_app.logger.error(f"Error fetching AlienVault data: {str(e)}")
        return None

@web.route('/')
def index():
    """Main dashboard page"""
    # Get basic stats
    stats = get_stats()
    
    # Get IOC types for chart
    ioc_types = db.session.query(
        IOC.type, 
        func.count(IOC.id)
    ).group_by(IOC.type).all()
    
    # Get IOC sources for chart
    sources = db.session.query(
        IOC.source, 
        func.count(IOC.id)
    ).group_by(IOC.source).all()
    
    # Get recent IOCs for table
    recent_cutoff = datetime.utcnow() - timedelta(days=1)
    recent_iocs = db.session.query(IOC).filter(
        IOC.first_seen >= recent_cutoff
    ).order_by(desc(IOC.first_seen)).limit(10).all()
    
    # Get recent feed runs
    feed_runs = db.session.query(FeedRun).order_by(
        desc(FeedRun.start_time)
    ).limit(5).all()
    
    # Fetch real-time AlienVault data
    alienvault_data = fetch_alienvault_dashboard_data()
    
    return render_template(
        'index.html',
        total_iocs=stats['total_iocs'],
        recent_count=stats['recent_iocs'],
        ioc_types=ioc_types,
        sources=sources,
        recent_iocs=recent_iocs,
        feed_runs=feed_runs,
        alienvault_data=alienvault_data,
        realtime_enabled=(alienvault_data is not None)
    )

@web.route('/iocs')
def ioc_list():
    """IOC explorer page"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Parse filter parameters
    type_filter = request.args.get('type')
    source_filter = request.args.get('source')
    search = request.args.get('search')
    since = request.args.get('since')
    min_confidence = request.args.get('min_confidence')
    
    # Build the base query
    query = IOC.query
    
    # Apply filters
    if type_filter:
        query = query.filter(IOC.type == type_filter)
    
    if source_filter:
        query = query.filter(IOC.source == source_filter)
    
    if search:
        query = query.filter(IOC.value.like(f'%{search}%'))
    
    if min_confidence:
        query = query.filter(IOC.confidence_score >= float(min_confidence))
    
    if since:
        # Parse time period (e.g., 24h, 48h, 168h)
        hours = int(since.rstrip('h'))
        since_time = datetime.utcnow() - timedelta(hours=hours)
        query = query.filter(IOC.first_seen >= since_time)
    
    # Get all available types and sources for filter dropdowns
    ioc_types = db.session.query(IOC.type).distinct().all()
    ioc_types = [t[0] for t in ioc_types if t[0]]
    
    sources = db.session.query(IOC.source).distinct().all()
    sources = [s[0] for s in sources if s[0]]
    
    # Get paginated IOCs
    pagination = query.order_by(desc(IOC.first_seen)).paginate(
        page=page, per_page=per_page
    )
    
    # Track applied filters for UI
    filters = {
        'type': type_filter,
        'source': source_filter,
        'search': search,
        'since': since,
        'min_confidence': min_confidence
    }
    
    # Get real-time OTX data if available
    alienvault_api_key = os.environ.get('ALIENVAULT_API_KEY')
    has_realtime = bool(alienvault_api_key)
    
    return render_template(
        'ioc_list.html', 
        iocs=pagination.items,
        pagination=pagination,
        ioc_types=ioc_types,
        sources=sources,
        filters=filters,
        has_realtime=has_realtime
    )

@web.route('/feeds')
def feeds():
    """Feed status page"""
    # Get feed runs grouped by feed name
    feed_stats = db.session.query(
        FeedRun.feed_name,
        func.count(FeedRun.id),
        func.max(FeedRun.start_time),
        func.sum(FeedRun.items_added)
    ).group_by(FeedRun.feed_name).all()
    
    # Get recent feed runs
    recent_runs = db.session.query(FeedRun).order_by(
        desc(FeedRun.start_time)
    ).limit(20).all()
    
    return render_template(
        'feeds.html',
        feed_stats=feed_stats,
        recent_runs=recent_runs
    )

@web.route('/relationships')
def relationships():
    """Threat intelligence relationships visualization"""
    # Get counts for different entity types
    actor_count = db.session.query(ThreatActor).count()
    campaign_count = db.session.query(Campaign).count()
    ioc_count = db.session.query(IOC).count()
    vuln_count = db.session.query(Vulnerability).count()
    
    # Get relationship statistics
    rel_stats = db.session.query(
        Relationship.type,
        func.count(Relationship.id)
    ).group_by(Relationship.type).all()
    
    # In a real implementation, we would fetch the actual relationship data
    # Here we'll just pass the counts as we're using mock data in the frontend
    return render_template(
        'relationships.html',
        actor_count=actor_count,
        campaign_count=campaign_count,
        ioc_count=ioc_count,
        vuln_count=vuln_count,
        rel_stats=rel_stats
    )

@web.route('/stats')
def stats():
    """Statistics API endpoint"""
    return jsonify(get_stats())

@web.route('/realtime/alienvault')
def realtime_alienvault():
    """Real-time data from AlienVault OTX API"""
    try:
        # Fetch real-time data from AlienVault
        alienvault_data = fetch_alienvault_dashboard_data()
        
        if not alienvault_data:
            return jsonify({
                "status": "error",
                "message": "Failed to fetch real-time data from AlienVault"
            }), 500
        
        return jsonify({
            "status": "success",
            "data": alienvault_data
        })
    except Exception as e:
        current_app.logger.error(f"Error in real-time AlienVault endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500 