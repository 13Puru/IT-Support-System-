import React from "react";

// Higher Order Component to restrict actions based on user role
const withRoleAccess = (WrappedComponent) => {
  return (props) => {
    // Try to get userRole from props, then from localStorage if not found
    const userRole = props.userRole || localStorage.getItem('userRole');
    // console.log("withRoleAccess using userRole:", userRole);
    
    const isAuthorized = userRole === "admin" || userRole === "agent";
    // console.log("isAuthorized calculated as:", isAuthorized);
    
    return <WrappedComponent {...props} isAuthorized={isAuthorized} />;
  };
};


export default withRoleAccess;
