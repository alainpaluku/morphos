import { useState, ChangeEvent } from 'react';
import * as THREE from 'three';
import ExportService, { ExportFormat } from '../../services/ExportService';
import { Model, GCodeSettings } from '../../types';

interface ExportModalProps {
  currentModel: Model;
  stlData: ArrayBuffer | null;
  geometry: THREE.BufferGeometry | null;
  onClose: () => void;
}

// Export format icons
const FormatIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'stl':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'obj':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case '3mf':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'gcode':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      );
    case 'jscad':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

function ExportModal({ currentModel, stlData, geometry, onClose }: ExportModalProps): JSX.Element {
  const [selectedFormat, setSelectedFormat] = useState<string>('stl');
  const [gcodeSettings, setGcodeSettings] = useState<GCodeSettings>({
    layerHeight: 0.2,
    nozzleTemp: 200,
    bedTemp: 60,
    printSpeed: 50,
    travelSpeed: 120,
    infillDensity: 20
  });
  const [exporting, setExporting] = useState<boolean>(false);

  const formats = ExportService.getAvailableFormats();

  const handleExport = async (): Promise<void> => {
    if (!currentModel) return;

    setExporting(true);
    try {
      const filename = currentModel.name.replace(/\s+/g, '_');

      switch (selectedFormat) {
        case 'stl':
          if (!stlData) throw new Error('STL data not available');
          ExportService.exportSTL(stlData, filename);
          break;
        case 'obj':
          if (!geometry) throw new Error('Geometry not available');
          ExportService.exportOBJ(geometry, filename);
          break;
        case '3mf':
          if (!stlData) throw new Error('STL data not available');
          ExportService.export3MF(stlData, filename);
          break;
        case 'gcode':
          if (!geometry) throw new Error('Geometry not available');
          ExportService.exportGCODE(geometry, filename, gcodeSettings);
          break;
        case 'jscad':
          if (!currentModel.code) throw new Error('Code not available');
          ExportService.exportJSCAD(currentModel.code, filename);
          break;
        default:
          throw new Error('Unknown format');
      }

      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Export failed: ${errorMessage}`);
    } finally {
      setExporting(false);
    }
  };

  const selectedFormatData = formats.find(f => f.id === selectedFormat);
  const canExport = selectedFormatData && (
    (selectedFormatData.requiresSTL && stlData) ||
    (selectedFormatData.requiresGeometry && geometry) ||
    (selectedFormatData.requiresCode && currentModel?.code)
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--bg-tertiary)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Export Model</h2>
              <p className="text-sm text-[var(--text-secondary)]">{currentModel?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Select Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              {formats.map((format) => {
                const isAvailable = 
                  (format.requiresSTL && stlData) ||
                  (format.requiresGeometry && geometry) ||
                  (format.requiresCode && currentModel?.code) ||
                  (!format.requiresSTL && !format.requiresGeometry && !format.requiresCode);

                return (
                  <button
                    key={format.id}
                    onClick={() => isAvailable && setSelectedFormat(format.id)}
                    disabled={!isAvailable}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedFormat === format.id
                        ? 'border-[var(--border-color)] bg-[var(--accent)]/10'
                        : isAvailable
                        ? 'border-[var(--border-color)] hover:border-[var(--border-color)] bg-[var(--bg-secondary)]/50'
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/30 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-[var(--text-secondary)]">
                        <FormatIcon type={format.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold mb-1 flex items-center gap-2">
                          {format.name}
                          {!isAvailable && (
                            <span className="text-xs text-[var(--text-secondary)]">(N/A)</span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)]">{format.description}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1 font-mono">{format.extension}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GCODE Settings */}
          {selectedFormat === 'gcode' && (
            <div className="bg-[var(--bg-secondary)]/50 rounded-xl p-4 border border-[var(--border-color)]">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Printer Settings
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Layer Height (mm)</label>
                  <input
                    type="number"
                    value={gcodeSettings.layerHeight}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setGcodeSettings({...gcodeSettings, layerHeight: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    step="0.05"
                    min="0.1"
                    max="0.4"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Nozzle Temp (°C)</label>
                  <input
                    type="number"
                    value={gcodeSettings.nozzleTemp}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setGcodeSettings({...gcodeSettings, nozzleTemp: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    min="180"
                    max="260"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Bed Temp (°C)</label>
                  <input
                    type="number"
                    value={gcodeSettings.bedTemp}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setGcodeSettings({...gcodeSettings, bedTemp: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    min="0"
                    max="110"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Print Speed (mm/s)</label>
                  <input
                    type="number"
                    value={gcodeSettings.printSpeed}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setGcodeSettings({...gcodeSettings, printSpeed: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    min="20"
                    max="100"
                  />
                </div>
              </div>
              <div className="mt-3 p-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg">
                <p className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Note: This generates basic G-code. For production, use a dedicated slicer like Cura or PrusaSlicer.</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex items-center justify-between">
          <div className="text-sm text-[var(--text-secondary)]">
            {selectedFormatData && (
              <span>Export as <span className="font-mono text-[var(--text-secondary)]">{selectedFormatData.extension}</span></span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={!canExport || exporting}
              className="px-6 py-2 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all font-medium flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
