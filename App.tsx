import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Vehicle } from './types';
import { searchVehicle, getSearchSuggestions, getExpiringVehicles } from './services/fleetService';
import { saveFleetData, loadFleetData, clearFleetData } from './services/persistenceService';
import SearchBar from './components/SearchBar';
import VehicleInfoCard from './components/VehicleInfoCard';
import LoadingSpinner from './components/LoadingSpinner';
import ReportView from './components/ReportView';
import AlertView from './components/AlertView';
import { UploadCloud } from './components/Icons';

// This makes TypeScript aware of the XLSX library loaded from the CDN
declare var XLSX: any;

const App: React.FC = () => {
    const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
    const [vehicle, setVehicle] = useState<Vehicle | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [view, setView] = useState<'search' | 'report' | 'alert'>('search');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const storedData = await loadFleetData();
                if (storedData) {
                    setAllVehicles(storedData.vehicles);
                    setFileName(storedData.fileName);
                    setLastUpdated(new Date(storedData.lastUpdated));
                }
            } catch (err) {
                console.error("Failed to load data from storage:", err);
                setError("Could not load saved data. Please upload a new file.");
            } finally {
                setIsInitializing(false);
            }
        };

        initializeApp();
    }, []);

    const loadSuggestions = useCallback(async () => {
        if (allVehicles.length > 0) {
            try {
                const { regNos, fleetNos } = await getSearchSuggestions(allVehicles);
                setSuggestions([...regNos, ...fleetNos]);
            } catch (err) {
                console.error("Failed to load suggestions:", err);
            }
        }
    }, [allVehicles]);

    useEffect(() => {
        loadSuggestions();
    }, [loadSuggestions]);

    const expiringVehiclesCount = useMemo(() => {
        if (allVehicles.length > 0) {
            return getExpiringVehicles(allVehicles, 20).length;
        }
        return 0;
    }, [allVehicles]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { cellDates: true });

                if (json.length === 0) {
                    throw new Error("The Excel file is empty or the first sheet has no data.");
                }

                // Map Excel column headers (e.g., "RegNo:") to our Vehicle type keys (e.g., "regNo")
                const columnMap: { [key: string]: keyof Vehicle } = {
                    'RegNo:': 'regNo',
                    'fleetNo:': 'fleetNo',
                    'vehicleDescription': 'vehicleDescription',
                    'vehicleModel': 'vehicleModel',
                    'vehicleOwner': 'vehicleOwner',
                    'fuelSensorOwner': 'fuelSensorOwner',
                    'FuelLimit': 'fuelLimit',
                    'user': 'user',
                    'designation': 'designation',
                    'Status': 'status',
                    'businessUnit': 'businessUnit',
                    'Rent Amount (QAR)': 'rentAmount',
                    'LastUpdated': 'lastUpdated',
                    'vehiclePhoto': 'vehiclePhoto',
                    'S. #': 'sNo',
                    'SAP #': 'sapNo',
                    'Category': 'category',
                    'Sub-Category': 'subCategory',
                    'Brand': 'brand',
                    'Seating Capacity': 'seatingCapacity',
                    'Capacity with': 'capacityWith',
                    'UOM': 'uom',
                    'Yom': 'yom',
                    'Chassis No.': 'chassisNo',
                    'Engine No.': 'engineNo',
                    'Cylinders': 'cylinders',
                    'Registration Expiry': 'registrationExpiry',
                    'Insurance Expiry': 'insuranceExpiry',
                    'Insurance validity': 'insuranceValidity',
                    'GPS': 'gps',
                    'Driver SAP No': 'driverSapNo',
                    'Position': 'position',
                    'Contact Number': 'contactNumber',
                    'EVRF#': 'evrfNo',
                    'On-Hire Date': 'onHireDate',
                    'Off-Hire Date': 'offHireDate',
                    'LVRF #': 'lvrfNo',
                    'LVRF Approval Type': 'lvrfApprovalType',
                    'Custody Date': 'custodyDate',
                    'LVRF Expiry': 'lvrfExpiry',
                    'Exf Date': 'exfDate',
                    'Fuel Type': 'fuelType',
                    'Rented or Owned': 'rentedOrOwned',
                    'Contract': 'contract',
                    'Project': 'project',
                    'Remarks': 'remarks',
                    'Replacement Vehicle': 'replacementVehicle',
                    'Replacement Vehicle.Registration Expiry': 'replacementVehicleRegExpiry',
                    'Sourcing Of Pmvs': 'sourcingOfPmvs',
                    'Link': 'link',
                };

                const processedVehicles = json.map(row => {
                    const vehicle: Partial<Vehicle> = {};
                    for (const key in columnMap) {
                        if (row[key] !== undefined) {
                            const vehicleKey = columnMap[key];
                            // @ts-ignore
                            let value = row[key];
                             if (vehicleKey === 'rentAmount') {
                                let numericValue = 0;
                                if (typeof value === 'string') {
                                    // Remove commas, currency symbols, and any other non-numeric characters except for a decimal point.
                                    const cleanedValue = value.replace(/[^0-9.]+/g, "");
                                    numericValue = cleanedValue ? parseFloat(cleanedValue) : 0;
                                } else if (typeof value === 'number') {
                                    numericValue = value;
                                }
                                value = isNaN(numericValue) ? 0 : numericValue;
                            }
                             // @ts-ignore
                            vehicle[vehicleKey] = value;
                        }
                    }
                    if (!vehicle.vehiclePhoto) {
                        vehicle.vehiclePhoto = `https://picsum.photos/seed/${vehicle.fleetNo || vehicle.regNo}/600/400`;
                    }
                    return vehicle as Vehicle;
                });
                
                const newLastUpdated = new Date();
                await saveFleetData({
                    vehicles: processedVehicles,
                    fileName: file.name,
                    lastUpdated: newLastUpdated,
                });

                setAllVehicles(processedVehicles);
                setFileName(file.name);
                setLastUpdated(newLastUpdated);
                
            } catch (err: any) {
                setError(`Failed to parse the Excel file. Please ensure it is a valid .xlsx file with the correct column headers. Error: ${err.message}`);
                setFileName('');
            } finally {
                setIsParsing(false);
            }
        };
        reader.onerror = () => {
             setError("Failed to read the file.");
             setIsParsing(false);
        }
        reader.readAsArrayBuffer(file);
    };

    const handleSearch = async (query: string) => {
        if (!query) {
            setVehicle(undefined);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        setVehicle(null);

        try {
            const result = await searchVehicle(query, allVehicles);
            setVehicle(result);
            if (!result) {
                setError(`No vehicle found for query: "${query}"`);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = async () => {
        try {
            await clearFleetData();
            setAllVehicles([]);
            setVehicle(undefined);
            setError(null);
            setSuggestions([]);
            setFileName('');
            setLastUpdated(null);
            setView('search');
            setSearchQuery('');
        } catch (err) {
            console.error("Failed to clear stored data:", err);
            setError("Could not clear stored data. Please refresh the page.");
        }
    };
    
    const handleReportRowClick = (vehicleIdentifier: string) => {
        setView('search');
        setSearchQuery(vehicleIdentifier);
        handleSearch(vehicleIdentifier);
    };

    const renderFileUpload = () => (
         <div className="text-center p-8 bg-gray-800 rounded-lg border border-dashed border-gray-600 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-300">Welcome</h2>
            <p className="text-gray-400 mt-2 mb-6">To begin, please upload your Fleet Master List Excel file (.xlsx).</p>
            {isParsing ? <LoadingSpinner /> : (
                <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform transform hover:scale-105">
                        <UploadCloud className="w-5 h-5 mr-2" />
                        Select Excel File
                    </label>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx, .xls" onChange={handleFileUpload} />
                </div>
            )}
            {error && (
                <div className="mt-4 text-center p-4 bg-red-900/50 rounded-lg">
                    <p className="text-red-300">{error}</p>
                </div>
            )}
            <div className="text-xs text-gray-500 mt-6">
                <p>Note: The file is processed and stored in your browser and is never uploaded to a server.</p>
                 <p className="mt-2">Required columns: RegNo:, fleetNo:, vehicleDescription, etc.</p>
            </div>
        </div>
    );

    const renderSearchView = () => (
        <>
            <div className="mb-6">
                <SearchBar 
                    onSearch={handleSearch} 
                    suggestions={suggestions} 
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                />
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-green-400">
                        {fileName} loaded ({allVehicles.length} vehicles found).
                    </p>
                    {lastUpdated && (
                        <p className="text-xs text-gray-500 text-right">
                        Last updated: {lastUpdated.toLocaleString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {!isLoading && error && (
                    <div className="text-center p-8 bg-gray-800 rounded-lg">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
                {!isLoading && vehicle === undefined && (
                        <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-300">Search Ready</h2>
                        <p className="text-gray-400 mt-2">Enter a Registration or Fleet Number to find a vehicle.</p>
                    </div>
                )}
                {!isLoading && vehicle && <VehicleInfoCard vehicle={vehicle} />}
            </div>
        </>
    );

    const renderContent = () => {
        if (isInitializing) {
            return <LoadingSpinner />;
        }

        if (allVehicles.length === 0) {
            return renderFileUpload();
        }

        switch (view) {
            case 'search':
                return renderSearchView();
            case 'report':
                return <ReportView vehicles={allVehicles} onVehicleSelect={handleReportRowClick} />;
            case 'alert':
                return <AlertView vehicles={allVehicles} onVehicleSelect={handleReportRowClick} />;
            default:
                return renderSearchView();
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
            <header className="p-4 sm:p-6 shadow-md bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">Fleet Management Updated MasterList</h1>
                        <p className="text-sm text-gray-400">Status and Other Details</p>
                    </div>
                     <div className="flex items-center gap-4">
                        {allVehicles.length > 0 && (
                            <>
                                <div className="flex items-center bg-gray-700/50 rounded-lg p-1">
                                    <button
                                        onClick={() => setView('search')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'search' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        Search
                                    </button>
                                    <button
                                        onClick={() => setView('report')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'report' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        Reports
                                    </button>
                                    <button
                                        onClick={() => setView('alert')}
                                        className={`relative px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'alert' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        Alerts
                                        {expiringVehiclesCount > 0 && (
                                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                                {expiringVehiclesCount}
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700/80 hover:bg-gray-700 border border-gray-600 transition-colors duration-200"
                                    title="Clear current data and upload a new file"
                                >
                                    <UploadCloud className="w-5 h-5" />
                                    Upload New
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                   {renderContent()}
                </div>
            </main>

            <footer className="text-center p-4 mt-auto text-gray-500 text-sm">
                <p>Created by ALI, m.nharakkat@eleganciagroup.com</p>
            </footer>
        </div>
    );
};

export default App;