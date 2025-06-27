import React from 'react';

export function MobileOptimizationDemo() {
  return (
    <div className="rounded-lg border p-4 mb-8">
      <h2 className="text-xl font-semibold mb-4">Mobile Optimization Features</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-medium">Responsive Layout</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            <div className="bg-gray-100 p-4 rounded">Item 1</div>
            <div className="bg-gray-100 p-4 rounded">Item 2</div>
            <div className="bg-gray-100 p-4 rounded">Item 3</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Grid adjusts from 3 columns to 1 column on mobile
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium">Touch-Friendly Inputs</h3>
          <div className="mt-2 space-y-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Large Touch Target
            </button>
            <div>
              <label className="block text-sm font-medium">Mobile-friendly input</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Font size optimized for mobile" 
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium">Responsive Table</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Species</th>
                  <th className="px-4 py-2">Weight</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">Lion #1</td>
                  <td className="px-4 py-2">Lion</td>
                  <td className="px-4 py-2">180 kg</td>
                  <td className="px-4 py-2">2025-06-20</td>
                  <td className="px-4 py-2">Active</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">Elephant #3</td>
                  <td className="px-4 py-2">Elephant</td>
                  <td className="px-4 py-2">3400 kg</td>
                  <td className="px-4 py-2">2025-06-21</td>
                  <td className="px-4 py-2">Completed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium">Bottom Action Bar Demo</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4">
            Mobile devices will show actions as a fixed bottom bar
          </p>
          <div className="form-actions">
            <button className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            <button className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
          </div>
        </section>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>View on different devices to see responsive behavior</p>
        <p className="mt-1">Current viewport width: <span id="viewport-width">[Client-side]</span>px</p>
      </div>

      {/* Script to display viewport width */}
      <script dangerouslySetInnerHTML={{ __html: `
        function updateViewportWidth() {
          const elem = document.getElementById('viewport-width');
          if (elem) elem.innerText = window.innerWidth;
        }
        window.addEventListener('load', updateViewportWidth);
        window.addEventListener('resize', updateViewportWidth);
      `}} />
    </div>
  );
}
