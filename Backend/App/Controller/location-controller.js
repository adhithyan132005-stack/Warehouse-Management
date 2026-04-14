const Location = require("../Model/location-model")
const Inventory=require("../Model/inventory-model")
const locationController = {}

// locationController.list = async (req, res) => {
//     try {
//         const locations = await Location.find()
//         res.json(locations)
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// }



locationController.list = async (req, res) => {
    try {
        const locations = await Location.find()

        const data = await Promise.all(
            locations.map(async (loc) => {
                const total = await Inventory.aggregate([
                    { $match: { locationId: loc._id } },
                    { $group: { _id: null, totalQty: { $sum: "$quantity" } } }
                ])

                return {
                    ...loc.toObject(),
                    totalQty: total[0]?.totalQty || 0
                }
            })
        )

        res.json(data)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
}

locationController.create = async (req, res) => {
    const body = req.body
    try {
        const location = await Location.create(body)
        res.status(201).json(location)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = locationController
