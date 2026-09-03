import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import './GatiVia.css';

interface LeadForm {
  name: string;
  mobile: string;
  email: string;
  message: string;
}

export default function GatiVia() {
  const [formData, setFormData] = useState<LeadForm>({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<LeadForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateField = (name: keyof LeadForm, value: string) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Full name is required.';
    } else if (name === 'mobile') {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!value) {
        error = 'Mobile number is required.';
      } else if (!phoneRegex.test(value)) {
        error = 'Enter a valid 10-digit mobile number (starting with 6-9).';
      }
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        error = 'Email address is required.';
      } else if (!emailRegex.test(value)) {
        error = 'Please enter a valid email structure.';
      }
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;
    if (name === 'mobile') {
      cleanValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    if (formErrors[name as keyof LeadForm]) {
      validateField(name as keyof LeadForm, cleanValue);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e1 = validateField('name', formData.name);
    const e2 = validateField('mobile', formData.mobile);
    const e3 = validateField('email', formData.email);

    if (e1 || e2 || e3) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          calculatorData: null
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormData({ name: '', mobile: '', email: '', message: '' });
        }, 5000);
      } else {
        alert(resData.error || 'Something went wrong. Please check your form fields.');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      alert('Network error. Failed to connect to the backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('contact-sales');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    /* ---------------------------------------------------------
       Coverage grid — 1,000 dots, each roughly 25 pincodes.
       24,189 of 25,178 support reverse pickup, so ~39 read faint.
       --------------------------------------------------------- */
    var grid = document.getElementById('dotgrid');
    if (grid) {
      var TOTAL = 1000, GAPS = 39, seed = 20260903, off: Record<number, number> = {}, n = 0;
      function rnd(){ seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
      while (n < GAPS) { var k = Math.floor(rnd() * TOTAL); if (!off[k]) { off[k] = 1; n++; } }
      var dots = '';
      for (var i = 0; i < TOTAL; i++) dots += off[i] ? '<i class="off"></i>' : '<i></i>';
      grid.innerHTML = dots;
    }

    /* ---------------------------------------------------------
       Rate and slab engine
       --------------------------------------------------------- */
    var out = document.getElementById('results');
    if (!out) return;

    var CITY: Record<string, string> = {
      '560':'Bengaluru','110':'New Delhi','400':'Mumbai','600':'Chennai','700':'Kolkata',
      '500':'Hyderabad','411':'Pune','380':'Ahmedabad','302':'Jaipur','226':'Lucknow',
      '781':'Guwahati','190':'Srinagar','682':'Kochi','641':'Coimbatore','462':'Bhopal',
      '800':'Patna','751':'Bhubaneswar','160':'Chandigarh','122':'Gurugram','201':'Noida',
      '452':'Indore','440':'Nagpur','395':'Surat','834':'Ranchi','248':'Dehradun',
      '403':'Panaji','744':'Port Blair','737':'Gangtok','795':'Imphal','799':'Agartala',
      '530':'Visakhapatnam','575':'Mangaluru','620':'Tiruchirappalli','143':'Amritsar','313':'Udaipur'
    };
    var METRO  = ['110','400','560','600','700','500'];
    var REMOTE = ['78','79','19','744','737','793','794','795','796','797','798','799'];

    var CARRIERS = [
      { code:'DLV-SF',   name:'Delhivery Surface',      note:'Widest tier-2 and tier-3 network, automated hub sorting',
        base:{local:29,regional:35,metro:44,national:52,remote:70}, sla:96.8, rto:6.8, day:0,  cod:35, max:20, noCod:false },
      { code:'XB-STD',   name:'Xpressbees',             note:'Strong economics on heavier D2C parcels',
        base:{local:27,regional:33,metro:41,national:49,remote:74}, sla:95.9, rto:7.1, day:0,  cod:32, max:15, noCod:false },
      { code:'ECOM-EXP', name:'Ecom Express',           note:'Deep rural reach and doorstep COD collection',
        base:{local:30,regional:36,metro:45,national:53,remote:68}, sla:94.7, rto:7.8, day:0,  cod:34, max:10, noCod:false },
      { code:'BD-EXP',   name:'Bluedart Express',       note:'Air network with time-definite delivery for high-value goods',
        base:{local:48,regional:60,metro:72,national:88,remote:118}, sla:99.1, rto:5.2, day:-1, cod:45, max:25, noCod:false },
      { code:'DTDC-PRI', name:'DTDC Priority',          note:'Reliable on B2B freight and express documents',
        base:{local:28,regional:34,metro:43,national:50,remote:64}, sla:95.1, rto:6.9, day:0,  cod:33, max:20, noCod:false },
      { code:'SFX-SD',   name:'Shadowfax',              note:'Same-day and next-day inside metro clusters',
        base:{local:34,regional:46,metro:56,national:0,  remote:0},  sla:97.2, rto:5.9, day:-1, cod:36, max:8, noCod:false  },
      { code:'EKT-STD',  name:'Ekart Logistics',        note:'High-volume marketplace lanes at a low slab cost',
        base:{local:26,regional:32,metro:39,national:47,remote:0},  sla:94.2, rto:8.4, day:1,  cod:30, max:12, noCod:false },
      { code:'AMZ-SHP',  name:'Amazon Shipping',        note:'Prepaid-only network with unusually predictable transit',
        base:{local:28,regional:34,metro:42,national:50,remote:0},  sla:96.1, rto:6.2, day:0,  cod:0,  max:15, noCod:true },
      { code:'PC-EXP',   name:'The Professional Couriers', note:'Dense southern and western branch network',
        base:{local:27,regional:33,metro:40,national:48,remote:62}, sla:93.6, rto:8.1, day:1,  cod:31, max:20, noCod:false },
      { code:'IP-SPD',   name:'India Post Speed',       note:'Reaches pincodes no private carrier will service',
        base:{local:24,regional:29,metro:34,national:40,remote:48}, sla:88.4, rto:9.6, day:2,  cod:28, max:35, noCod:false }
    ];

    var ZONE_NAME: Record<string, string> = { local:'local', regional:'regional', metro:'metro to metro', national:'national', remote:'special area' };
    var ZONE_DAYS: Record<string, number[]> = { local:[1,2], regional:[2,3], metro:[2,3], national:[3,5], remote:[5,8] };

    var goal = 'balanced', pay = 'prepaid';

    function el(id: string){ return document.getElementById(id) as HTMLInputElement | null; }
    function digits(id: string){ return ((el(id)?.value) || '').replace(/\D/g,''); }
    function kg(n: number){ return (Math.round(n * 100) / 100) + ' kg'; }
    function starts(p: string, list: string[]){ for (var i=0;i<list.length;i++) if (p.indexOf(list[i]) === 0) return true; return false; }

    function zoneOf(a: string, b: string){
      if (a.length < 6 || b.length < 6) return null;
      if (starts(a, REMOTE) || starts(b, REMOTE)) return 'remote';
      if (a.slice(0,3) === b.slice(0,3)) return 'local';
      if (a.slice(0,2) === b.slice(0,2)) return 'regional';
      if (METRO.indexOf(a.slice(0,3)) > -1 && METRO.indexOf(b.slice(0,3)) > -1) return 'metro';
      if (a.charAt(0) === b.charAt(0)) return 'regional';
      return 'national';
    }

    function span(arr: number[], v: number){
      var mn = Math.min.apply(null, arr), mx = Math.max.apply(null, arr);
      return mx === mn ? 0 : (v - mn) / (mx - mn);
    }

    function card(r: any, top: boolean, why: string){
      return '<div class="res' + (top ? ' top' : '') + '">'
        + (top ? '<span class="res-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> Recommended</span>' : '')
        + '<div class="res-grid"><div>'
        +   '<div class="res-name"><h4>' + r.c.name + '</h4><span class="res-code">' + r.c.code + '</span></div>'
        +   '<p class="res-note">' + r.c.note + '</p>'
        +   '<div class="res-stats">'
        +     '<span><b>' + r.d1 + '\u2013' + r.d2 + ' days</b></span>'
        +     '<span>On time <b>' + r.sla.toFixed(1) + '%</b></span>'
        +     '<span>RTO <b>' + r.rto.toFixed(1) + '%</b></span>'
        +   '</div>'
        + '</div><div class="res-right">'
        +   '<div class="res-price">\u20b9' + r.total + '</div>'
        +   '<div class="res-break">Freight \u20b9' + r.freight + (r.cod ? ' + COD \u20b9' + r.cod : '') + ' + 18% GST</div>'
        +   '<a href="#" class="act ' + (top ? 'act-solid' : 'act-quiet') + ' act-sm">Select carrier</a>'
        + '</div></div>'
        + (top ? '<div class="res-why"><i class="fa-solid fa-circle-check"></i><span>' + why + '</span></div>' : '')
        + '</div>';
    }

    function run(){
      var a = digits('pickPin'), b = digits('dropPin');
      var pickCityEl = document.getElementById('pickCity');
      var dropCityEl = document.getElementById('dropCity');
      var pickPinEl = document.getElementById('pickPin');
      var dropPinEl = document.getElementById('dropPin');
      var wtEl = el('wt');
      var dLEl = el('dL');
      var dWEl = el('dW');
      var dHEl = el('dH');

      if (pickCityEl) pickCityEl.textContent = a.length >= 3 ? (CITY[a.slice(0,3)] || '') : '';
      if (dropCityEl) dropCityEl.textContent = b.length >= 3 ? (CITY[b.slice(0,3)] || '') : '';
      if (pickPinEl) pickPinEl.className = (a.length && a.length < 6) ? 'bad' : '';
      if (dropPinEl) dropPinEl.className = (b.length && b.length < 6) ? 'bad' : '';

      var dead = parseFloat(wtEl?.value || '0') || 0;
      var L = parseFloat(dLEl?.value || '0') || 0,
          W = parseFloat(dWEl?.value || '0') || 0,
          H = parseFloat(dHEl?.value || '0') || 0;
      var vol   = (L * W * H) / 5000;
      var chg   = Math.max(dead, vol);
      var slabs = Math.max(1, Math.ceil(chg / 0.5));

      var wtOutEl = document.getElementById('wtOut');
      var volOutEl = document.getElementById('volOut');
      var chgOutEl = document.getElementById('chgOut');

      if (wtOutEl) wtOutEl.textContent  = dead.toFixed(1) + ' kg';
      if (volOutEl) volOutEl.textContent = kg(vol);
      if (chgOutEl) chgOutEl.textContent = kg(chg) + ' \u00b7 ' + (vol > dead ? 'volumetric' : 'dead weight');

      var resCountEl = document.getElementById('resCount');
      if (!out) return;

      var z = zoneOf(a, b);
      if (!z) {
        if (resCountEl) resCountEl.textContent = 'Waiting for a valid route';
        out.innerHTML = '<div class="empty">Enter two six-digit pincodes to compare live rates across the network.</div>';
        return;
      }

      var rows = [];
      for (var i = 0; i < CARRIERS.length; i++) {
        var c = CARRIERS[i], baseObj = (c.base as any)[z];
        if (!baseObj) continue;
        if (chg > c.max) continue;
        if (pay === 'cod' && c.noCod) continue;
        var addl    = Math.round(baseObj * 0.85);
        var freight = baseObj + (slabs - 1) * addl;
        var codFee  = pay === 'cod' ? c.cod : 0;
        var d       = ZONE_DAYS[z];
        var d1      = Math.max(1, d[0] + c.day);
        var d2      = Math.max(d1 + 1, d[1] + c.day);
        rows.push({
          c: c,
          freight: freight,
          cod: codFee,
          total: Math.round((freight + codFee) * 1.18),
          d1: d1, d2: d2,
          sla: c.sla - (z === 'remote' ? 4.6 : z === 'national' ? 1.1 : 0) - (pay === 'cod' ? 0.7 : 0),
          rto: c.rto + (z === 'remote' ? 2.4 : z === 'national' ? 0.5 : 0) + (pay === 'cod' ? 2.1 : 0),
          score: 0
        });
      }

      if (!rows.length) {
        if (resCountEl) resCountEl.textContent = 'No partner covers this shipment';
        out.innerHTML = '<div class="empty">No partner services this lane at ' + kg(chg)
          + (pay === 'cod' ? ' on cash on delivery' : '') + '. Try a lighter parcel or a different route.</div>';
        return;
      }

      var tots: number[] = [], slas: number[] = [], rtos: number[] = [], days: number[] = [];
      rows.forEach(function(r){ tots.push(r.total); slas.push(r.sla); rtos.push(r.rto); days.push(r.d2); });
      rows.forEach(function(r: any){
        r.score = 0.42 * span(tots, r.total)
                + 0.26 * (1 - span(slas, r.sla))
                + 0.20 * span(rtos, r.rto)
                + 0.12 * span(days, r.d2);
      });

      if (goal === 'cheapest')     rows.sort(function(x,y){ return x.total - y.total || x.d2 - y.d2; });
      else if (goal === 'fastest') rows.sort(function(x,y){ return x.d2 - y.d2 || x.total - y.total; });
      else                         rows.sort(function(x,y){ return x.score - y.score; });

      var top      = rows[0];
      var cheapest = Math.min.apply(null, tots);
      var quickest = Math.min.apply(null, days);
      var bestSla  = Math.max.apply(null, slas);
      var leastRto = Math.min.apply(null, rtos);

      var bits = [];
      if (top.total === cheapest) bits.push('cheapest serviceable option');
      else bits.push('\u20b9' + (top.total - cheapest) + ' over the cheapest');
      if (top.sla >= bestSla - 0.4) bits.push('best on-time record on this lane');
      else if (top.sla >= 96) bits.push('on-time above 96%');
      if (top.rto <= leastRto + 0.4) bits.push('lowest RTO risk');
      else if (top.rto <= 7) bits.push('RTO under 7%');
      if (top.d2 === quickest) bits.push('fastest promised date');

      var lead = goal === 'cheapest' ? 'Lowest total cost.'
               : goal === 'fastest'  ? 'Earliest promised date.'
               : 'Best balance of cost, speed and delivery success.';
      var why = lead + ' ' + bits.join(', ').replace(/^./, function(m){ return m.toUpperCase(); }) + '.';

      if (resCountEl) resCountEl.innerHTML = '<b>' + rows.length + '</b> of 26 partners serviceable \u00b7 '
        + ZONE_NAME[z] + ' zone \u00b7 ' + slabs + (slabs === 1 ? ' slab' : ' slabs') + ' of 500 g';

      var shown = Math.min(rows.length, 5), html = '';
      for (var j = 0; j < shown; j++) html += card(rows[j], j === 0, why);
      if (rows.length > shown) {
        html += '<p class="viz-cap" style="margin:18px 0 0">' + (rows.length - shown)
          + ' more serviceable partners are ranked below the cut and stay available in the platform.</p>';
      }
      out.innerHTML = html;
    }

    ['pickPin','dropPin','wt','dL','dW','dH'].forEach(function(id){
      var node = el(id);
      if (node) {
        node.addEventListener('input', run);
        node.addEventListener('change', run);
      }
    });

    document.querySelectorAll('.goal button').forEach(function(btn){
      btn.addEventListener('click', function(){
        goal = btn.getAttribute('data-goal') || '';
        document.querySelectorAll('.goal button').forEach(function(o){
          o.setAttribute('aria-pressed', String(o === btn));
        });
        run();
      });
    });

    document.querySelectorAll('.seg button').forEach(function(btn){
      btn.addEventListener('click', function(){
        pay = btn.getAttribute('data-pay') || '';
        document.querySelectorAll('.seg button').forEach(function(o){
          o.setAttribute('aria-pressed', String(o === btn));
        });
        run();
      });
    });

    run();
  }, []);

  return (
    <>
      <div id="gativia-console">
      {/* ===================== NAV ===================== */}
      <header className="topbar">
        <div className="topbar-in">
          <a href="#" className="brand"><i className="fa-solid fa-cube"></i> GatiVia</a>
          <nav className="navlinks">
            <a href="#rates">Rates</a>
            <a href="#ship">Ship</a>
            <a href="#track">Track</a>
            <a href="#reconcile">Reconcile</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="navside">
            <Link to="/" className="signin" style={{ fontWeight: 600, color: '#0a4f40' }}>&larr; Back to AuditRax</Link>
            <a href="#" className="signin">Sign in</a>
            <a href="#contact-sales" onClick={scrollToContact} className="act act-solid">Get a demo</a>
          </div>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="hero">
        <div className="shell hero-in">
          <div>
            <h1>The intelligent aggregation platform for modern logistics.</h1>
            <p className="hero-sub">Book across 26 courier partners from one screen, then watch every shipment reconcile itself against what you were quoted, charged and actually paid.</p>
            <div className="hero-acts">
              <a href="#" className="act act-solid">Start shipping free</a>
              <a href="#reconcile" className="act act-quiet">See how reconciliation works</a>
            </div>
            <p className="hero-foot">No card required. Bring your own courier contracts on any plan.</p>
          </div>

          <div className="stage">
            <div className="panel">
              <div className="panel-head">
                <h4>Allocating ORD-48213</h4>
                <span>Bengaluru to Delhi</span>
              </div>
              <div className="panel-meta">
                <div><small>Weight</small><b>1.2 kg</b></div>
                <div><small>Payment</small><b>COD</b></div>
                <div><small>Rule</small><b>Lowest cost at SLA</b></div>
              </div>

              <div className="opt picked">
                <div className="opt-name">Delhivery Surface<em>98.1% on-time to 110034</em></div>
                <div className="opt-eta">3 days</div>
                <div className="opt-rate">₹64<i className="fa-solid fa-check opt-tick"></i></div>
              </div>
              <div className="opt">
                <div className="opt-name">Xpressbees<em>96.4% on-time to 110034</em></div>
                <div className="opt-eta">3 days</div>
                <div className="opt-rate">₹67</div>
              </div>
              <div className="opt">
                <div className="opt-name">Bluedart Express<em>99.2% on-time to 110034</em></div>
                <div className="opt-eta">2 days</div>
                <div className="opt-rate">₹98</div>
              </div>

              <div className="panel-recon">
                <div className="recon-set">
                  <div><small>Quoted</small><b>₹64.00</b></div>
                  <div><small>Invoiced</small><b>₹64.00</b></div>
                  <div><small>Variance</small><b>₹0.00</b></div>
                </div>
                <span className="recon-flag"><i className="fa-solid fa-circle-check"></i> Reconciled</span>
              </div>
            </div>

            <div className="floater">
              <small>Recovered this month</small>
              <b>₹41,280</b>
              <span>Across 214 disputed shipments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PROOF ===================== */}
      <section className="proof">
        <div className="shell proof-in">
          <div><b>26</b><span>Courier partners on one login</span></div>
          <div><b>25,178</b><span>Pincodes serviceable for forward delivery</span></div>
          <div><b>24,189</b><span>Of those also serviceable for reverse pickup</span></div>
          <div><b>2.8%</b><span>Average shipping spend recovered each month</span></div>
        </div>
      </section>

      {/* ===================== COMPARISON REDESIGN ===================== */}
      <section className="vs-section">
        <div className="shell">
          <div className="vs-header">
            <h2>The Difference is in the Ledger</h2>
            <p>Compare the traditional fragmented approach against GatiVia's unified platform.</p>
          </div>
          <div className="vs-grid">
            <div className="vs-card before">
              <div className="vs-card-head">
                <div className="vs-badge">How most teams ship today</div>
                <h3>Seven tabs, three spreadsheets, one very long month-end</h3>
              </div>
              <ol className="vs-list">
                <li><div className="vs-num">1</div><span>Rates and serviceability checked one courier panel at a time, then keyed in by hand.</span></li>
                <li><div className="vs-num">2</div><span>Allocation decided on habit, because comparing properly takes longer than shipping.</span></li>
                <li><div className="vs-num">3</div><span>Weight adjustments appear on the invoice days later, with no record of what was packed.</span></li>
                <li><div className="vs-num">4</div><span>Dispute windows close in seven days. The ones you miss are simply written off.</span></li>
                <li><div className="vs-num">5</div><span>COD remittance reconciled against orders manually, courier by courier.</span></li>
              </ol>
            </div>
            
            <div className="vs-divider">
              <span>VS</span>
            </div>
            
            <div className="vs-card after">
              <div className="vs-card-head">
                <div className="vs-badge gativia"><i className="fa-solid fa-cube"></i> How it works on GatiVia</div>
                <h3>One platform, and a ledger that closes itself</h3>
              </div>
              <ol className="vs-list">
                <li><div className="vs-num">1</div><span>Live rates and serviceability from every partner, compared on one screen before you book.</span></li>
                <li><div className="vs-num">2</div><span>Allocation runs on your rules — cost, speed, COD viability or pincode performance.</span></li>
                <li><div className="vs-num">3</div><span>Declared weight and dimensions captured at packing, so the evidence exists before the dispute does.</span></li>
                <li><div className="vs-num">4</div><span>Variances flagged the day the invoice lands, and claims filed inside the window automatically.</span></li>
                <li><div className="vs-num">5</div><span>Every COD remittance matched to its order, with the shortfall named rather than guessed at.</span></li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== RATE ENGINE ===================== */}
      <section className="rate-band" id="rates">
        <div className="shell">
          <div className="rate-top">
            <div className="sec-head">
              <h2>Compare all 26 couriers before you book</h2>
              <p>Enter the parcel and the route. The engine works out volumetric weight, applies the zone tariff and the slab, then ranks every serviceable partner on cost, promised date and how they actually perform on that lane.</p>
            </div>
            <div className="goal-wrap">
              <span>Rank results by</span>
              <div className="goal" role="group" aria-label="Ranking preference">
                <button type="button" data-goal="balanced" aria-pressed="true">Balanced</button>
                <button type="button" data-goal="cheapest" aria-pressed="false">Cheapest</button>
                <button type="button" data-goal="fastest" aria-pressed="false">Fastest</button>
              </div>
            </div>
          </div>

          <div className="engine">
            {/* inputs */}
            <div className="form">
              <h3><i className="fa-solid fa-sliders"></i> Shipment details</h3>

              <div className="fld">
                <span className="lbl">Route</span>
                <div className="pair">
                  <div className="pin">
                    <input id="pickPin" type="text" inputMode="numeric" maxLength={6} defaultValue="560103" aria-label="Pickup pincode" />
                    <span className="city" id="pickCity">Bengaluru</span>
                  </div>
                  <div className="pin">
                    <input id="dropPin" type="text" inputMode="numeric" maxLength={6} defaultValue="110034" aria-label="Delivery pincode" />
                    <span className="city" id="dropCity">New Delhi</span>
                  </div>
                </div>
              </div>

              <div className="fld">
                <div className="wt-head">
                  <label htmlFor="wt">Physical weight</label>
                  <b id="wtOut">1.2 kg</b>
                </div>
                <input className="rng" id="wt" type="range" min="0.2" max="15" step="0.1" defaultValue="1.2" />
                <div className="ticks"><span>0.2 kg</span><span>5 kg</span><span>10 kg</span><span>15 kg</span></div>
              </div>

              <div className="fld">
                <span className="lbl">Box dimensions in centimetres</span>
                <div className="dims">
                  <div><input id="dL" type="number" min="1" max="150" defaultValue="25" aria-label="Length in cm" /><small>Length</small></div>
                  <div><input id="dW" type="number" min="1" max="150" defaultValue="18" aria-label="Width in cm" /><small>Width</small></div>
                  <div><input id="dH" type="number" min="1" max="150" defaultValue="12" aria-label="Height in cm" /><small>Height</small></div>
                </div>
              </div>

              <div className="fld">
                <div className="calc">
                  <div className="calc-row"><span>Volumetric weight, length × width × height ÷ 5000</span><b id="volOut">1.08 kg</b></div>
                  <div className="calc-row"><span>Billed in slabs of</span><b>500 g</b></div>
                  <div className="calc-row tot"><span>Chargeable weight</span><span className="chip" id="chgOut">1.2 kg · dead weight</span></div>
                </div>
              </div>

              <div className="fld">
                <span className="lbl">Payment</span>
                <div className="seg" role="group" aria-label="Payment mode">
                  <button type="button" data-pay="prepaid" aria-pressed="true"><i className="fa-solid fa-credit-card"></i> Prepaid</button>
                  <button type="button" data-pay="cod" aria-pressed="false"><i className="fa-solid fa-indian-rupee-sign"></i> Cash on delivery</button>
                </div>
              </div>
            </div>

            {/* results */}
            <div>
              <div className="res-head">
                <span id="resCount">Checking serviceability</span>
                <span>All rates include 18% GST</span>
              </div>
              <div id="results"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SHIP ===================== */}
      <section className="band" id="ship">
        <div className="shell">
          <div className="sec-head">
            <h2>Get it out the door on the right courier</h2>
            <p>Aggregation is table stakes. What matters is whether the console picks better than your best ops executive does at 6pm on a Friday.</p>
          </div>
          <div className="feat">
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-plug"></i>
                <h3>One shipment model</h3>
              </div>
              <p>Delhivery, Bluedart, Ecom Express, Xpressbees and twenty-two more behave identically in the API and in the interface.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-sliders"></i>
                <h3>Allocation on your rules</h3>
              </div>
              <p>Rank by landed cost, promised date, COD success or historical performance on that specific pincode. Override any shipment by hand.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-handshake"></i>
                <h3>Your own contracts</h3>
              </div>
              <p>Already negotiated directly with a carrier? Plug those rates in and keep the discount. Available on every paid plan, not just enterprise.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-weight-scale"></i>
                <h3>Weight locked at packing</h3>
              </div>
              <p>Dimensions, deadweight and a timestamped photo captured before dispatch, held as evidence against later adjustments.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-print"></i>
                <h3>Bulk without the mess</h3>
              </div>
              <p>Import a day's orders, allocate them in one pass, and print labels and manifests as a single job.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-map-pin"></i>
                <h3>Serviceability upfront</h3>
              </div>
              <p>Pincode coverage, COD limits and cut-off times checked before the order is confirmed, not after it fails.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== COVERAGE ===================== */}
      <section className="band tinted" id="coverage">
        <div className="shell">
          <div className="cov">
            <div className="cov-stats">
              <div className="cov-stat">
                <b>26</b>
                <span>Courier partners under one contract and one login</span>
              </div>
              <div className="cov-stat">
                <b>25,178</b>
                <span>Pincodes where at least one partner will deliver a forward shipment</span>
              </div>
              <div className="cov-stat">
                <b>24,189</b>
                <span>Of those, the pincodes where a reverse pickup can also be booked</span>
              </div>
            </div>
            <div>
              <div className="dotgrid" id="dotgrid" role="img" aria-label="Coverage grid: roughly 96 percent of serviceable pincodes also support reverse pickup"></div>
              <div className="cov-cap">
                <span className="cov-key"><em></em> Forward and reverse</span>
                <span className="cov-key off"><em></em> Forward only, no reverse pickup yet</span>
              </div>
              <p className="cov-cap" style={{display: 'block'}}>Each dot stands for about 25 pincodes. The platform knows which is which before you confirm an order, so a return-eligible product is never sold into a pincode we cannot collect from.</p>
            </div>
          </div>

          <div className="partners">
            <span>Delhivery</span><span>Blue Dart</span><span>Xpressbees</span><span>Ecom Express</span>
            <span>DTDC</span><span>Shadowfax</span><span>Ekart</span><span>Amazon Shipping</span>
            <span>India Post</span><span>The Professional Couriers</span><span>Gati</span><span>Safexpress</span>
            <span>Trackon</span><span>Smartr</span><span className="more">and twelve more</span>
          </div>
        </div>
      </section>

      {/* ===================== TRACK ===================== */}
      <section className="band" id="track">
        <div className="shell">
          <div className="sec-head">
            <h2>Then keep it moving, and keep the cash flowing</h2>
            <p>A failed delivery costs you twice — forward freight, then reverse. The work is in catching it before the parcel turns around.</p>
          </div>

          <svg className="tline" style={{marginBottom: '18px'}} viewBox="0 0 1020 152" role="img" aria-label="A shipment timeline running from pickup to delivery, with a failed attempt on Wednesday evening that triggers an automatic reattempt and completes on Thursday morning.">
            <line x1="20" y1="62" x2="1000" y2="62" stroke="#e8ebe9" strokeWidth="2" />
            <line x1="20" y1="62" x2="1000" y2="62" stroke="#0a4f40" strokeWidth="2" strokeDasharray="8 8" className="marching-line" />
            <line x1="608" y1="62" x2="804" y2="62" stroke="#c9906a" strokeWidth="3" className="error-pulse" />

            <g fontFamily="Inter, sans-serif">
              <circle cx="20" cy="62" r="6.5" fill="#0a4f40" />
              <text x="20" y="94" fontSize="14" fontWeight="500" fill="#111827">Picked up</text>
              <text x="20" y="114" fontSize="12.5" fill="#77837f">Mon 09:14 · Delhivery</text>

              <circle cx="216" cy="62" r="6.5" fill="#0a4f40" />
              <text x="216" y="94" fontSize="14" fontWeight="500" fill="#111827" textAnchor="middle">Hub scan</text>
              <text x="216" y="114" fontSize="12.5" fill="#77837f" textAnchor="middle">Tue 02:40 · Nagpur</text>

              <circle cx="412" cy="62" r="6.5" fill="#0a4f40" />
              <text x="412" y="94" fontSize="14" fontWeight="500" fill="#111827" textAnchor="middle">Out for delivery</text>
              <text x="412" y="114" fontSize="12.5" fill="#77837f" textAnchor="middle">Wed 08:05 · Delhi</text>

              <circle cx="608" cy="62" r="7.5" fill="#b0703f" />
              <text x="608" y="94" fontSize="14" fontWeight="500" fill="#8a4b28" textAnchor="middle">Attempt failed</text>
              <text x="608" y="114" fontSize="12.5" fill="#8a4b28" textAnchor="middle">Wed 17:22 · not reachable</text>
              <line x1="608" y1="30" x2="608" y2="52" stroke="#c9906a" strokeWidth="1.5" />
              <text x="608" y="22" fontSize="12.5" fill="#8a4b28" textAnchor="middle">WhatsApp and IVR sent in 40 seconds</text>

              <circle cx="804" cy="62" r="6.5" fill="#b0703f" />
              <text x="804" y="94" fontSize="14" fontWeight="500" fill="#111827" textAnchor="middle">Buyer confirmed</text>
              <text x="804" y="114" fontSize="12.5" fill="#77837f" textAnchor="middle">Wed 17:48 · reattempt set</text>

              <circle cx="1000" cy="62" r="8.5" fill="#0a4f40" />
              <text x="1000" y="94" fontSize="14" fontWeight="600" fill="#0a4f40" textAnchor="end">Delivered</text>
              <text x="1000" y="114" fontSize="12.5" fill="#77837f" textAnchor="end">Thu 11:40 · COD collected</text>
            </g>
          </svg>
          <p className="viz-cap" style={{margin: '0 0 62px'}}>One shipment, one sequence. Every courier reports scan events differently, so the console normalises them into the same six states before your team or your buyer ever sees them.</p>

          <div className="feat">
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-timeline"></i>
                <h3>One tracking timeline</h3>
              </div>
              <p>Every courier's scan events normalised into a single sequence, on one branded page your buyer can actually read.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-comment-dots"></i>
                <h3>Failed deliveries, handled</h3>
              </div>
              <p>An NDR triggers WhatsApp and IVR confirmation with the buyer straight away, and the reattempt is booked without an ops queue.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-shield-halved"></i>
                <h3>Risk caught before dispatch</h3>
              </div>
              <p>High-RTO pincodes, repeat refusers and unreachable numbers flagged at order confirmation, when cancelling is still free.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-indian-rupee-sign"></i>
                <h3>COD you can forecast</h3>
              </div>
              <p>Collected, in transit to you, and remitted — separated clearly, per courier, with expected dates you can plan against.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-rotate-left"></i>
                <h3>Returns that keep revenue</h3>
              </div>
              <p>Self-serve returns with exchange offered first, reverse pickup booked automatically, refund released on scan.</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-chart-simple"></i>
                <h3>Performance by lane</h3>
              </div>
              <p>On-time rate, RTO rate and cost per delivered order, broken down by courier and destination so allocation keeps improving.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== RECONCILE ===================== */}
      <section className="ledger-band" id="reconcile">
        <div className="shell">
          <div className="ledger-head">
            <h2>Every shipment carries its own money trail</h2>
            <p>Most platforms hand your invoice to a separate tool weeks later, which then audits data it never captured. AuditRax reads the booking and the invoice from the same ledger, so a variance has an answer attached before anyone asks.</p>
          </div>

          <svg className="pipe" viewBox="0 0 1020 122" role="img" aria-label="A pipeline in five stages: order created, rate locked, weight sealed at packing, invoice parsed on arrival, then settled or claimed.">
            <line x1="20" y1="34" x2="1000" y2="34" stroke="rgba(255,255,255,.22)" strokeWidth="2" />
            <g fontFamily="Inter, sans-serif">
              <circle cx="20" cy="34" r="7" fill="#0a4f40" stroke="#ffffff" strokeWidth="2" />
              <text x="20" y="68" fontSize="14.5" fontWeight="500" fill="#ffffff">Order created</text>
              <text x="20" y="88" fontSize="12.5" fill="#b8d9cc">Address, value and contents</text>

              <circle cx="265" cy="34" r="7" fill="#0a4f40" stroke="#ffffff" strokeWidth="2" />
              <text x="265" y="68" fontSize="14.5" fontWeight="500" fill="#ffffff" textAnchor="middle">Rate locked</text>
              <text x="265" y="88" fontSize="12.5" fill="#b8d9cc" textAnchor="middle">The quote is recorded, not estimated</text>

              <circle cx="510" cy="34" r="7" fill="#0a4f40" stroke="#ffffff" strokeWidth="2" />
              <text x="510" y="68" fontSize="14.5" fontWeight="500" fill="#ffffff" textAnchor="middle">Weight sealed</text>
              <text x="510" y="88" fontSize="12.5" fill="#b8d9cc" textAnchor="middle">Dimensions and photo at packing</text>

              <circle cx="755" cy="34" r="7" fill="#0a4f40" stroke="#ffffff" strokeWidth="2" />
              <text x="755" y="68" fontSize="14.5" fontWeight="500" fill="#ffffff" textAnchor="middle">Invoice parsed</text>
              <text x="755" y="88" fontSize="12.5" fill="#b8d9cc" textAnchor="middle">Each line matched to its booking</text>

              <circle cx="1000" cy="34" r="9" fill="#a7e0ce" />
              <text x="1000" y="68" fontSize="14.5" fontWeight="600" fill="#a7e0ce" textAnchor="end">Settled or claimed</text>
              <text x="1000" y="88" fontSize="12.5" fill="#b8d9cc" textAnchor="end">Every variance has an owner</text>
            </g>
          </svg>

          <div className="ledger">
            <div className="led-row head">
              <div>Shipment</div><div>Quoted</div><div>Charged</div><div>Variance</div><div>Status</div>
            </div>
            <div className="led-row">
              <div className="led-id">ORD-48213</div>
              <div className="led-num" data-l="Quoted">₹64.00</div>
              <div className="led-num" data-l="Charged">₹64.00</div>
              <div className="led-num" data-l="Variance">₹0.00</div>
              <div className="led-ok" data-l="Status"><i className="fa-solid fa-circle-check"></i> Matched</div>
            </div>
            <div className="led-row led-gap">
              <div className="led-id">ORD-48209</div>
              <div className="led-num" data-l="Quoted">₹58.00</div>
              <div className="led-num" data-l="Charged">₹91.00</div>
              <div className="led-num" data-l="Variance">+₹33.00</div>
              <div className="led-warn" data-l="Status"><i className="fa-solid fa-triangle-exclamation"></i> Weight claim filed</div>
            </div>
            <div className="led-row">
              <div className="led-id">ORD-48204</div>
              <div className="led-num" data-l="Quoted">₹72.00</div>
              <div className="led-num" data-l="Charged">₹72.00</div>
              <div className="led-num" data-l="Variance">₹0.00</div>
              <div className="led-ok" data-l="Status"><i className="fa-solid fa-circle-check"></i> Matched</div>
            </div>
            <div className="led-row">
              <div className="led-id">ORD-48198</div>
              <div className="led-num" data-l="Quoted">₹64.00</div>
              <div className="led-num" data-l="Charged">₹64.00</div>
              <div className="led-num" data-l="Variance">−₹64.00</div>
              <div className="led-ok" data-l="Status"><i className="fa-solid fa-circle-check"></i> Credited back</div>
            </div>
            <div className="led-foot">
              <span>4 of 1,842 shipments shown for October</span>
              <span><b>₹41,280</b> recovered · <b>96%</b> of invoice lines matched automatically</span>
            </div>
          </div>

          <div className="ledger-notes">
            <div>
              <h4>Invoices read on arrival</h4>
              <p>Each courier invoice is parsed line by line and matched to the booking that created it. Nothing waits for month-end.</p>
            </div>
            <div>
              <h4>Claims filed inside the window</h4>
              <p>Dispute windows run seven to fourteen days. Claims go out with the packing evidence attached, before the window closes.</p>
            </div>
            <div>
              <h4>Profit per order, not per parcel</h4>
              <p>Freight, COD fee, RTO cost and the reverse leg land against the original order, so margin is a fact rather than an estimate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTEGRATE + API ===================== */}
      <section className="band" id="integrate">
        <div className="shell">
          <div className="sec-head">
            <h2>Connects to what you already run</h2>
            <p>Native syncs for the stack most Indian D2C teams are on, and a plain REST API for everything else.</p>
          </div>

          <div className="int-grid">
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-brands fa-shopify"></i>
                <h3>Storefronts</h3>
              </div>
              <p>Shopify, WooCommerce, Magento and custom carts</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-warehouse"></i>
                <h3>OMS and WMS</h3>
              </div>
              <p>Unicommerce, Increff and your own inventory systems</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-calculator"></i>
                <h3>Finance</h3>
              </div>
              <p>Tally, Zoho Books and any ERP through AuditRax</p>
            </div>
            <div className="feat-card">
              <div className="feat-card-header">
                <i className="fa-solid fa-code"></i>
                <h3>Developers</h3>
              </div>
              <p>REST API, signed webhooks and a full sandbox</p>
            </div>
          </div>

          <div className="api">
            <div className="api-copy">
              <h3>One call to book, one webhook to reconcile</h3>
              <p>Send the order. The platform compares live rates across every connected partner, applies your allocation rules and returns an AWB with the quote already recorded against it.</p>
              <a href="#" className="act act-ghost">Read the API reference <i className="fa-solid fa-arrow-right" style={{fontSize: '12px'}}></i></a>
            </div>
            <div className="code">
              <span className="verb">POST</span> <span className="path">/v1/shipments</span><br/>
              <span className="punc">{'{'}</span><br/>
              &nbsp;&nbsp;<span className="key">"order_id"</span><span className="punc">:</span> <span className="str">"ORD-48213"</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"pickup_pincode"</span><span className="punc">:</span> <span className="str">"560103"</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"delivery_pincode"</span><span className="punc">:</span> <span className="str">"110034"</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"weight_kg"</span><span className="punc">:</span> <span className="num">1.2</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"dimensions_cm"</span><span className="punc">:</span> <span className="punc">[</span><span className="num">24</span><span className="punc">,</span> <span className="num">18</span><span className="punc">,</span> <span className="num">9</span><span className="punc">]</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"payment_mode"</span><span className="punc">:</span> <span className="str">"COD"</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"allocation"</span><span className="punc">:</span> <span className="str">"lowest_cost_at_sla"</span><br/>
              <span className="punc">{'}'}</span><br/>
              <div className="code-rule"></div>
              <span className="cmt">200 OK</span><br/>
              <span className="punc">{'{'}</span><br/>
              &nbsp;&nbsp;<span className="key">"awb"</span><span className="punc">:</span> <span className="str">"DLV8842190037"</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"courier"</span><span className="punc">:</span> <span className="str">"delhivery_surface"</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"quoted_amount"</span><span className="punc">:</span> <span className="num">64.00</span><span className="punc">,</span><br/>
              &nbsp;&nbsp;<span className="key">"weight_locked"</span><span className="punc">:</span> <span className="num">true</span><br/>
              <span className="punc">{'}'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PRICING ===================== */}
      <section className="pricing" id="pricing">
        <div className="shell">
          <div className="price-head">
            <h2>Pay for the software, not for the postage</h2>
            <p>Courier rates are negotiated on your behalf and passed through at cost. The subscription buys allocation, reconciliation and the claims that pay for it.</p>
          </div>

          <div className="plans">
            <div className="plan">
              <h3>Starter</h3>
              <p className="who">For brands finding their footing, under 300 orders a month</p>
              <div className="fig"><sup>₹</sup>0</div>
              <p className="per">Free, permanently</p>
              <ul>
                <li><i className="fa-solid fa-check"></i><span>All 26 courier partners at standard rates</span></li>
                <li><i className="fa-solid fa-check"></i><span>Two storefront integrations</span></li>
                <li><i className="fa-solid fa-check"></i><span>Unified tracking and branded tracking page</span></li>
                <li><i className="fa-solid fa-check"></i><span>Weight and dimension capture at packing</span></li>
              </ul>
              <a href="#" className="act act-quiet act-full">Create an account</a>
            </div>

            <div className="plan lead">
              <h3>Growth</h3>
              <p className="who">For teams where a missed dispute window costs real money</p>
              <div className="fig"><sup>₹</sup>1,499</div>
              <p className="per">Per month, billed monthly</p>
              <ul>
                <li><i className="fa-solid fa-check"></i><span>Everything in Starter, at discounted rates</span></li>
                <li><i className="fa-solid fa-check"></i><span>Rule-based allocation across all partners</span></li>
                <li><i className="fa-solid fa-check"></i><span>Automatic invoice reconciliation and claim filing</span></li>
                <li><i className="fa-solid fa-check"></i><span>WhatsApp and IVR workflows for failed deliveries</span></li>
                <li><i className="fa-solid fa-check"></i><span>Bring your own courier contracts</span></li>
                <li><i className="fa-solid fa-check"></i><span>Full API access and webhooks</span></li>
              </ul>
              <a href="#" className="act act-solid act-full">Start a 14-day trial</a>
            </div>

            <div className="plan">
              <h3>Enterprise</h3>
              <p className="who">For multi-warehouse operations with their own carrier agreements</p>
              <div className="fig">Custom</div>
              <p className="per">Annual agreement</p>
              <ul>
                <li><i className="fa-solid fa-check"></i><span>Everything in Growth</span></li>
                <li><i className="fa-solid fa-check"></i><span>Full AuditRax suite with ERP write-back</span></li>
                <li><i className="fa-solid fa-check"></i><span>Multi-location routing and warehouse rules</span></li>
                <li><i className="fa-solid fa-check"></i><span>Order-level profitability reporting</span></li>
                <li><i className="fa-solid fa-check"></i><span>Named account manager and uptime SLA</span></li>
              </ul>
              <a href="#" className="act act-quiet act-full">Talk to sales</a>
            </div>
          </div>

          <p className="price-note">A brand shipping 3,000 orders a month typically recovers between ₹18,000 and ₹45,000 in weight and billing corrections. The Growth plan is designed to cost less than what it finds.</p>
        </div>
      </section>

      </div>

      <div className="font-sans text-gray-800 antialiased selection:bg-cyan-500 selection:text-white" style={{ background: '#fafafa', width: '100%' }}>
      {/* ===================== AUDITRAX PROMO (SPECIAL) ===================== */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight relative z-10">
            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AuditRax</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 relative z-10">
            GatiVia is a seamless extension of AuditRax, the ultimate revenue recovery platform. Automatically audit your entire e-commerce pipeline from payments to RTOs, all in one place.
          </p>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/20">
              Discover AuditRax &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== LEAD CAPTURE SECTION ===================== */}
      <section id="contact-sales" className="py-16 max-w-4xl mx-auto px-4 scroll-mt-24" style={{marginTop: '60px', marginBottom: '60px'}}>
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-6 sm:p-10 md:p-12 grid md:grid-cols-5 gap-10 items-center relative overflow-hidden">
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Info text */}
          <div className="md:col-span-2 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wider">
              🛡️ Enterprise Ready
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              Connect With Our Revenue Experts
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              See exactly where your multi-channel storefronts are leaking capital. Get a tailored audit protocol built for your brand's scale.
            </p>
            
            <div className="space-y-3 text-xs text-gray-500 font-semibold">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" /> No personal emails accepted
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" /> Response within 12 business hours
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" /> NDA guaranteed data safety
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="md:col-span-3 bg-gray-50 border border-gray-100 p-5 sm:p-6 md:p-8 rounded-2xl">
            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs mb-5 space-y-1">
                <p className="font-bold">🎉 The request has been received!</p>
                <p className="text-emerald-700 font-medium leading-relaxed">
                  Our representative will connect shortly.
                </p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full text-sm text-gray-800 bg-white border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition ${
                    formErrors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-500'
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input 
                    type="text" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    className={`w-full text-sm text-gray-800 bg-white border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition ${
                      formErrors.mobile ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-500'
                    }`}
                  />
                  {formErrors.mobile && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Work Email ID</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className={`w-full text-sm text-gray-800 bg-white border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition ${
                      formErrors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-500'
                    }`}
                  />
                  {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.email}</p>}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message</label>
                  <span className="text-[9px] text-gray-400 font-semibold italic">optional</span>
                </div>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3} 
                  placeholder="Tell us about your reconciliation volume..."
                  className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-xl text-sm transition-all shadow-md transform hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Submitting request...' : 'Submit Request →'}
              </button>
            </form>
          </div>

        </div>
      </section>
      </div>

      <div id="gativia-console">
      {/* ===================== FOOTER ===================== */}
      <footer className="foot">
        <div className="shell">
          <div className="foot-in">
            <div>
              <div className="foot-brand"><i className="fa-solid fa-cube"></i> GatiVia</div>
              <p className="foot-blurb">Shipping and reconciliation on one ledger, for e-commerce teams that would like their margins back.</p>
            </div>
            <div className="foot-col">
              <h5>Platform</h5>
              <a href="#ship">Ship and route</a>
              <a href="#track">Track and manage</a>
              <a href="#reconcile">Reconcile with AuditRax</a>
              <a href="#integrate">Integrations</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="foot-col">
              <h5>Developers</h5>
              <a href="#">API reference</a>
              <a href="#">Webhooks</a>
              <a href="#">Sandbox</a>
              <a href="#">Status</a>
            </div>
            <div className="foot-col">
              <h5>Company</h5>
              <a href="#">About AuditRax</a>
              <a href="#">Support</a>
              <a href="#">Security</a>
              <a href="#">Terms and privacy</a>
            </div>
            <div className="foot-col">
              <h5>Contact Us</h5>
              <a href="#">📍 Coimbatore, Tamil Nadu, India</a>
              <a href="mailto:connect@auditrax.in">✉️ connect@auditrax.in</a>
              <a href="tel:+919082348560">📞 +91 9082348560</a>
            </div>
          </div>
          <div className="foot-base">
            <span>© 2026 GatiVia. An AuditRax product.</span>
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
