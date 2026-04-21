const Address = require("../models/address");

exports.addAddress = async (req, res) => {
  try {
    const { userId, fullName, phoneNumber, houseNumber, currentAddress, state, city, district, pincode } = req.body;

    if (!userId || !fullName || !phoneNumber ||  !houseNumber || !currentAddress || !state || !city || !district || !pincode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }


      // Create new address entry
     const  address = new Address({ userId, fullName ,phoneNumber , houseNumber, currentAddress, state, city, district, pincode });
      await address.save();


    res.status(200).json({ success: true, message: "Address saved successfully", address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
exports.updateAddress = async (req, res) => {
    try {
      const { _id ,userId, fullName ,phoneNumber, houseNumber, currentAddress, state, city, district, pincode } = req.body;
  
      if (!userId || !fullName || !phoneNumber|| !houseNumber || !currentAddress || !state || !city || !district || !pincode) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
  
        // Create new address entry
        const updatedCategory = await Address.findByIdAndUpdate(
            _id,
            {fullName , phoneNumber , houseNumber,city,currentAddress,state,district,pincode},
            { new: true } // Returns the updated document
          );
      
          if (!updatedCategory) {
            return res.status(200).json({ responseCode: 400, message: "Address not found" });
          }
      
  
  
      res.status(200).json({responseCode: 400, message: "Address Updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ responseCode: 400, message: "Server error", error: error.message });
    }
  };

exports.getAddress = async (req, res) => {
    try {
      const { userId } = req.body;
  
      if (!userId) {
        return res.status(200).json({ success: false, message: "User ID is required" });
      }
  
      const address = await Address.find({ userId });
  
      if (!address) {
        return res.status(200).json({ success: false, message: "Address not found" });
      }
  
      res.status(200).json({ success: true, address });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  };
  
  exports.deleteAddress = async (req, res) => {
    try {
      const { _id } = req.body;
  
      const deletedAddress = await Address.findByIdAndDelete(_id);
  
      if (!deletedAddress) {
        return res.status(200).json({ responseCode: 400, message: "Address not found" });
      }
  
      res.status(200).json({ responseCode: 200, message: "Address deleted successfully" });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  };

exports.getAllAddress = async (req, res) => {
    try {
  
      
  
      const address = await Address.find();
  
  
  
      res.status(200).json({ success: true, address });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  };