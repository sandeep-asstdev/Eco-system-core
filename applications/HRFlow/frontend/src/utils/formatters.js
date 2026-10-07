export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrency = formatINR;

export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

export const getStatusBadgeStyle = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'FILLED':
    case 'CLEARED':
    case 'DISBURSED':
    case 'PRESENT':
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10';

    case 'PENDING':
    case 'PENDING_BM':
    case 'PENDING_HR':
    case 'HR_PROCESSING':
    case 'ON_HOLD':
    case 'HALF_DAY':
    case 'SUBMITTED':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10';

    case 'OPEN':
    case 'FORM_SUBMITTED':
    case 'PROCESSED':
    case 'GENERATED':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/10';

    case 'REJECTED':
    case 'RESIGNED':
    case 'LEFT_WITHOUT_INTIMATION':
    case 'TERMINATED':
    case 'ABSENT':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10';

    case 'CLOSED':
    case 'INACTIVE':
    case 'RETURNED':
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/10';
  }
};

export const numberToWordsINR = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 'Zero Rupees Only';
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (val) => {
    if (val < 20) return singleDigits[val];
    const unit = val % 10;
    return tens[Math.floor(val / 10)] + (unit ? ' ' + singleDigits[unit] : '');
  };

  const convertThreeDigits = (val) => {
    const hundred = Math.floor(val / 100);
    const rest = val % 100;
    let res = '';
    if (hundred) res += singleDigits[hundred] + ' Hundred';
    if (rest) res += (res ? ' ' : '') + convertTwoDigits(rest);
    return res;
  };

  let crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  let hundred = remainder;

  let words = [];
  if (crore) words.push(convertThreeDigits(crore) + ' Crore');
  if (lakh) words.push(convertTwoDigits(lakh) + ' Lakh');
  if (thousand) words.push(convertTwoDigits(thousand) + ' Thousand');
  if (hundred) words.push(convertThreeDigits(hundred));

  return 'Rupees ' + words.join(' ') + ' Only';
};

