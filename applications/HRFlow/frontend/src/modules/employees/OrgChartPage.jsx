import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Building2,
  Briefcase,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const OrgChartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'grid'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, branchRes] = await Promise.all([
          api.get('/employees?limit=200'),
          api.get('/branches').catch(() => ({ data: { data: [] } })),
        ]);
        setEmployees(empRes.data?.data?.employees || empRes.data?.data || []);
        setBranches(branchRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load org chart data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const departments = useMemo(() => {
    const depts = new Set();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [employees]);

  // Build employee hierarchy
  const { rootEmployees, employeeMap } = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      map[emp.id] = { ...emp, children: [] };
    });

    const roots = [];
    employees.forEach((emp) => {
      const node = map[emp.id];
      if (emp.reportingManagerId && map[emp.reportingManagerId]) {
        map[emp.reportingManagerId].children.push(node);
      } else {
        roots.push(node);
      }
    });

    return { rootEmployees: roots, employeeMap: map };
  }, [employees]);

  const toggleCollapse = (id) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getLevelBadgeColor = (levelNum) => {
    if (!levelNum) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (levelNum === 1) return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    if (levelNum <= 3) return 'bg-purple-100 text-purple-800 border-purple-200 font-semibold';
    if (levelNum <= 6) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const renderTreeNode = (node, depth = 0) => {
    const isCollapsed = collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isMatch =
      searchQuery &&
      `${node.firstName} ${node.lastName} ${node.designation} ${node.department} ${node.employeeCode}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Filter check
    if (selectedBranch !== 'ALL' && node.branchId !== selectedBranch && (!node.branch || node.branch.id !== selectedBranch)) {
      // If none of children match either, skip
      const hasMatchingChild = node.children.some(
        (c) => c.branchId === selectedBranch || (c.branch && c.branch.id === selectedBranch)
      );
      if (!hasMatchingChild) return null;
    }

    if (selectedDepartment !== 'ALL' && node.department !== selectedDepartment) {
      const hasMatchingDeptChild = node.children.some((c) => c.department === selectedDepartment);
      if (!hasMatchingDeptChild) return null;
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Employee Card */}
        <div
          className={`relative bg-white rounded-xl border p-3 w-64 shadow-xs transition-all hover:shadow-md ${
            isMatch ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {node.firstName?.[0]}
              {node.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-semibold">{node.employeeCode}</span>
                {node.level && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded border ${getLevelBadgeColor(
                      node.level.levelNumber
                    )}`}
                  >
                    L{node.level.levelNumber}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {node.firstName} {node.lastName}
              </h4>
              <p className="text-[11px] text-indigo-700 font-medium truncate">{node.designation}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 truncate">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{node.department || 'Operations'}</span>
                {node.branch?.name && (
                  <>
                    <span>•</span>
                    <span className="truncate">{node.branch.name.split(' ')[0]}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer with actions and expand toggle */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              onClick={() => navigate(`/employees/${node.id}`)}
              className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            {hasChildren && (
              <button
                onClick={() => toggleCollapse(node.id)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                <span>{node.children.length} Reports</span>
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Children Subtree */}
        {hasChildren && !isCollapsed && (
          <div className="relative flex flex-col items-center">
            {/* Vertical connector line */}
            <div className="w-0.5 h-6 bg-slate-300"></div>

            {/* Horizontal branch bar */}
            <div className="relative flex items-start gap-6 pt-2">
              {node.children.length > 1 && (
                <div
                  className="absolute top-0 left-32 right-32 h-0.5 bg-slate-300"
                  style={{
                    left: `${(1 / (node.children.length * 2)) * 100}%`,
                    right: `${(1 / (node.children.length * 2)) * 100}%`,
                  }}
                ></div>
              )}
              {node.children.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  <div className="w-0.5 h-2 bg-slate-300 -mt-2"></div>
                  {renderTreeNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold uppercase tracking-wider">
            <Network className="w-4 h-4" />
            <span>Workforce Hierarchy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Organization Hierarchy Chart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive reporting hierarchy for {user?.tenant?.organizationName || 'Bellad Group'} (Levels 1–10)
          </p>
        </div>

        {/* View & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium px-2 text-slate-600">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex text-xs shadow-2xs">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 font-medium rounded-md transition ${
                viewMode === 'tree' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tree Hierarchy
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 font-medium rounded-md transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Roster Grid
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">Levels:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Level 1 (MD)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Levels 2-3 (Executive)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Levels 4-6 (Management)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Levels 7-10 (Staff)
          </span>
        </div>
      </div>

      {/* Main Canvas View */}
      {loading ? (
        <div className="h-96 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Mapping enterprise organizational tree...</p>
          </div>
        </div>
      ) : viewMode === 'tree' ? (
        <div className="bg-slate-50/60 rounded-xl border border-slate-200/90 p-8 min-h-[600px] overflow-auto shadow-inner">
          <div
            className="flex justify-center transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="flex flex-wrap items-start justify-center gap-12">
              {rootEmployees.map((root) => renderTreeNode(root))}
            </div>
          </div>
        </div>
      ) : (
        /* Grid Roster View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {employees
            .filter((emp) => {
              if (selectedBranch !== 'ALL' && emp.branchId !== selectedBranch) return false;
              if (selectedDepartment !== 'ALL' && emp.department !== selectedDepartment) return false;
              if (
                searchQuery &&
                !`${emp.firstName} ${emp.lastName} ${emp.designation} ${emp.department} ${emp.employeeCode}`
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              )
                return false;
              return true;
            })
            .map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {emp.firstName[0]}
                      {emp.lastName[0]}
                    </div>
                    {emp.level && (
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getLevelBadgeColor(emp.level.levelNumber)}`}>
                        Level {emp.level.levelNumber}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {emp.firstName} {emp.lastName}
                    </h3>
                    <p className="text-xs text-indigo-700 font-medium">{emp.designation}</p>
                    <p className="text-[11px] text-slate-500">{emp.department} • {emp.branch?.name}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400">{emp.employeeCode}</span>
                  <button
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default OrgChartPage;
