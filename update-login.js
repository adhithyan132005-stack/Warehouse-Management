const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'login.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const addSection = `

          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center text-sm text-slate-400">
            Login with OTP instead?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/login-otp')} 
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              Use Email or Phone OTP
            </button>
          </div>`;

// Find the last div block and insert before closing
const searchStr = '          </div>\n        </div>\n      </div>\n    </div>\n  )\n}';
if (content.includes(searchStr)) {
  const newContent = content.replace(searchStr, addSection + '\n        </div>\n      </div>\n    </div>\n  )\n}');
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✓ Updated login.jsx successfully');
} else {
  console.log('✗ Could not find the exact text pattern');
  console.log('Trying alternative method...');
  
  // Try alternative - just add before the final closing }
  if (content.endsWith('  )\n}')) {
    const newContent = content.replace('  )\n}', addSection + '\n        </div>\n      </div>\n    </div>\n  )\n}');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('✓ Updated login.jsx successfully (alternative method)');
  }
}
