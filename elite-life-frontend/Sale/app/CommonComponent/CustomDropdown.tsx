import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { DropdownProps } from 'primereact/dropdown'; // Import the DropdownProps type

interface CustomDropDownProps extends DropdownProps {
  // Define any additional props you want to pass to the CustomDropDown
}

const CustomDropDown: React.FC<CustomDropDownProps> = (props) => {
  return (
    <Dropdown
      {...props} // Spread the props to the Dropdown component
    />
  );
};

export default CustomDropDown;