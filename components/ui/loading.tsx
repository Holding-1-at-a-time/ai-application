/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 28/02/2025 - 06:10:15
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 28/02/2025
    * - Author          : rrome
    * - Modification    : 
**/
import React from "react";

const LoadingSpinnerOne: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50"> {/* Full-screen overlay */}
            <div className="spinner">
                <div className="glow"></div>
                <div className="spinner-inner"></div> {/* Added inner spinner for better visualization */}
            </div>
        </div>
    );
};

export default LoadingSpinnerOne;