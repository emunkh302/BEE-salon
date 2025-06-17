// src/controllers/service.controller.ts
import { Request, Response, NextFunction } from 'express';
import Service, { IService } from '../models/Service.model';
import mongoose from 'mongoose';

// @desc    Create a new service for the logged-in artist
// @route   POST /api/services
// @access  Private/Artist
export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { category, name, description, price, duration } = req.body;
        const artistId = req.user?._id; // Get artist ID from the 'protect' middleware

        if (!category || !name || !price || !duration) {
            res.status(400).json({ message: 'Category, name, price, and duration are required.' });
            return;
        }

        const newService = await Service.create({
            artist: artistId,
            category,
            name,
            description,
            price,
            duration
        });

        res.status(201).json({
            message: 'Service created successfully.',
            data: newService
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all services for the logged-in artist
// @route   GET /api/services/my-services
// @access  Private/Artist
export const getMyServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const artistId = req.user?._id;
        const services = await Service.find({ artist: artistId });

        res.status(200).json({
            count: services.length,
            data: services
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a specific service owned by the logged-in artist
// @route   PUT /api/services/:id
// @access  Private/Artist
export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const serviceId = req.params.id;
        const artistId = req.user?._id;

        // Find the service by its ID
        const service = await Service.findById(serviceId);

        if (!service) {
            res.status(404).json({ message: 'Service not found.' });
            return;
        }

        // Ensure the logged-in user is the owner of the service
        if (service.artist.toString() !== artistId?.toString()) {
            res.status(403).json({ message: 'User not authorized to update this service.' });
            return;
        }

        // Update the service with the new data
        const updatedService = await Service.findByIdAndUpdate(serviceId, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            message: 'Service updated successfully.',
            data: updatedService
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete a specific service owned by the logged-in artist
// @route   DELETE /api/services/:id
// @access  Private/Artist
export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const serviceId = req.params.id;
        const artistId = req.user?._id;

        const service = await Service.findById(serviceId);

        if (!service) {
            res.status(404).json({ message: 'Service not found.' });
            return;
        }

        if (service.artist.toString() !== artistId?.toString()) {
            res.status(403).json({ message: 'User not authorized to delete this service.' });
            return;
        }

        // We use deleteOne() here which is more direct than findByIdAndRemove
        await service.deleteOne();

        res.status(200).json({ message: 'Service deleted successfully.' });

    } catch (error) {
        next(error);
    }
};
