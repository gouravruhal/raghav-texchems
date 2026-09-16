import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import type { Inquiry } from '../../types';
import { sanitizeSearchQuery } from '../../lib/validation';
import {
  Send,
  Trash2,
  Search,
  Download,
  RotateCcw,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminInquiriesPage: React.FC = () => {
  const { inquiries, updateInquiryStatus, deleteInquiry, companySettings } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredInquiries = useMemo(() => {
    const query = sanitizeSearchQuery(searchQuery).toLowerCase();

    return inquiries.filter((inq) => {
      const matchesStatus = filterStatus === 'All' || inq.status === filterStatus;

      const matchesQuery =
        !query ||
        inq.customerName.toLowerCase().includes(query) ||
        (inq.companyName && inq.companyName.toLowerCase().includes(query)) ||
        inq.phone.toLowerCase().includes(query) ||
        inq.email.toLowerCase().includes(query) ||
        inq.productCategory.toLowerCase().includes(query) ||
        inq.message.toLowerCase().includes(query) ||
        inq.id.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [inquiries, filterStatus, searchQuery]);

  const handleWhatsAppReply = (inq: Inquiry) => {
    const text = `Hello ${inq.customerName}, this is ${inq.assignedTo || 'the Sales Team'} from ${
      companySettings.companyName || 'Raghav Texchems'
    }. Regarding your technical RFQ for ${inq.productCategory}: "${inq.message}" - we are happy to assist with pricing, samples, and TDS datasheets...`;
    const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
    window.open(
      `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`,
      '_blank',
    );
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      alert('No customer inquiries to export.');
      return;
    }

    const headers = [
      'Inquiry ID',
      'Date',
      'Customer Name',
      'Company Name',
      'Phone',
      'Email',
      'Product Category',
      'Message / RFQ Details',
      'Status',
      'Assigned To'
    ];

    // OWASP A03: Neutralize CSV Formula Injection
    const sanitizeCsvCell = (val: string | undefined | null): string => {
      if (!val) return '""';
      const clean = String(val).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(clean)) {
        return `"'${clean}"`;
      }
      return `"${clean}"`;
    };

    const rows = inquiries.map((i) => [
      sanitizeCsvCell(i.id),
      sanitizeCsvCell(i.date),
      sanitizeCsvCell(i.customerName),
      sanitizeCsvCell(i.companyName),
      sanitizeCsvCell(i.phone),
      sanitizeCsvCell(i.email),
      sanitizeCsvCell(i.productCategory),
      sanitizeCsvCell(i.message),
      sanitizeCsvCell(i.status),
      sanitizeCsvCell(i.assignedTo),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `raghav_texchems_rfqs_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const newCount = inquiries.filter((i) => i.status === 'New').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'In Progress').length;
  const quotationSentCount = inquiries.filter((i) => i.status === 'Quotation Sent').length;
  const closedCount = inquiries.filter((i) => i.status === 'Closed').length;

  return (
    <div>
      {/* =========================================================
          HEADER
          ========================================================= */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer RFQ & Inquiry Manager</h1>
          <p className="admin-page-subtitle">
            Manage incoming product quote requests, track sales follow-ups, and send technical responses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            title="Export all inquiries to CSV"
          >
            <Download size={16} />
            Export RFQs to CSV
          </button>
        </div>
      </div>

      {/* =========================================================
          KPI STATS GRID
          ========================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#eff6ff', color: '#1d4ed8' }}
          >
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="stat-label">Total Inquiries</div>
            <div className="stat-number">{inquiries.length}</div>
            <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
              All time logged
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#fef2f2', color: '#dc2626' }}
          >
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="stat-label">New Actionable</div>
            <div className="stat-number" style={{ color: '#dc2626' }}>
              {newCount}
            </div>
            <div className="stat-trend" style={{ color: '#dc2626' }}>
              Pending first response
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#fef3c7', color: '#b45309' }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-label">In Progress</div>
            <div className="stat-number">{inProgressCount}</div>
            <div className="stat-trend" style={{ color: '#b45309' }}>
              Sample testing / tech review
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: '#ecfdf5', color: '#047857' }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-label">Quotation Sent</div>
            <div className="stat-number">{quotationSentCount}</div>
            <div className="stat-trend positive">Commercials provided</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          TOOLBAR: SEARCH & FILTER TABS
          ========================================================= */}
      <div
        className="admin-panel-card"
        style={{ marginBottom: '1.5rem', padding: '1.25rem' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {/* Search */}
          <div
            className="search-box-wrapper"
            style={{ margin: 0, flex: '1 1 280px', maxWidth: '420px' }}
          >
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by customer, company, phone, email, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { label: 'All', count: inquiries.length },
              { label: 'New', count: newCount },
              { label: 'In Progress', count: inProgressCount },
              { label: 'Quotation Sent', count: quotationSentCount },
              { label: 'Closed', count: closedCount },
            ].map(({ label, count }) => (
              <button
                key={label}
                type="button"
                className={`filter-btn ${filterStatus === label ? 'active' : ''}`}
                onClick={() => setFilterStatus(label)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.8rem',
                  fontSize: '0.82rem',
                }}
              >
                <span>{label}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    background: filterStatus === label ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: filterStatus === label ? 'white' : '#475569',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            ))}

            {(searchQuery || filterStatus !== 'All') && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('All');
                }}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                title="Reset filters"
              >
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          INQUIRIES TABLE
          ========================================================= */}
      <div className="admin-panel-card">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">Inquiry Queue</h3>
            <p
              style={{
                marginTop: '0.25rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              Showing <strong>{filteredInquiries.length}</strong> of{' '}
              <strong>{inquiries.length}</strong> RFQs
            </p>
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <div
            style={{
              padding: '4rem 1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <MessageSquare
              size={44}
              strokeWidth={1.5}
              style={{ marginBottom: '0.75rem', opacity: 0.4 }}
            />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
              No inquiries found
            </h3>
            <p style={{ margin: '0.4rem 0 1rem', fontSize: '0.88rem' }}>
              No customer quote requests match your active search and filter criteria.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('All');
              }}
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID & Date</th>
                  <th>Client Contact</th>
                  <th>Category & Technical RFQ</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th style={{ textAlign: 'right' }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id}>
                    {/* ID & Date */}
                    <td>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {inq.id}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.2rem',
                        }}
                      >
                        {inq.date}
                      </div>
                    </td>

                    {/* Client Contact */}
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {inq.customerName}
                      </strong>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.15rem',
                        }}
                      >
                        {inq.companyName && (
                          <span style={{ fontWeight: 600 }}>{inq.companyName} • </span>
                        )}
                        <a
                          href={`tel:${inq.phone}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {inq.phone}
                        </a>
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--primary-brand)',
                          marginTop: '0.1rem',
                        }}
                      >
                        <a
                          href={`mailto:${inq.email}?subject=Re:%20Raghav%20Texchems%20Technical%20RFQ%20${inq.id}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {inq.email}
                        </a>
                      </div>
                    </td>

                    {/* Category & Message */}
                    <td style={{ maxWidth: '340px' }}>
                      <span
                        className="product-category-tag"
                        style={{ display: 'inline-block', marginBottom: '0.35rem' }}
                      >
                        {inq.productCategory}
                      </span>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          background: '#f8fafc',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        "{inq.message}"
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <select
                        value={inq.status}
                        className={`status-select ${inq.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                        onChange={(e) =>
                          updateInquiryStatus(
                            inq.id,
                            e.target.value as Inquiry['status'],
                          )
                        }
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Quotation Sent">Quotation Sent</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Assigned To */}
                    <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {inq.assignedTo || 'Unassigned'}
                    </td>

                    {/* Quick Reply & Actions */}
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '0.45rem',
                          alignItems: 'center',
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-success"
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                          onClick={() => handleWhatsAppReply(inq)}
                          title="Open WhatsApp Technical Response"
                        >
                          <Send size={13} /> WhatsApp
                        </button>

                        <a
                          href={`mailto:${inq.email}?subject=Raghav%20Texchems%20Quotation%20for%20${encodeURIComponent(
                            inq.productCategory,
                          )}&body=Hello%20${encodeURIComponent(
                            inq.customerName,
                          )},%0D%0A%0D%0AThank%20you%20for%20contacting%20Raghav%20Texchems.%20Regarding%20your%20inquiry%20(${inq.id}):%0D%0A`}
                          className="admin-icon-btn"
                          title="Reply via Email"
                        >
                          <Mail size={15} />
                        </a>

                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete inquiry ${inq.id} from "${inq.customerName}"?`,
                              )
                            ) {
                              deleteInquiry(inq.id);
                            }
                          }}
                          title="Delete Inquiry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
