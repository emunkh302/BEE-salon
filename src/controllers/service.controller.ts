// src/controllers/service.controller.ts
import { Request, Response, NextFunction } from 'express';
import Service, { IService } from '../models/Service.model';
import mongoose from 'mongoose';

// @desc    Create a new service for a specific artist
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // UPDATED: Admin must provide the artistId in the request body
        const { artistId, category, name, description, price, duration } = req.body;

        if (!artistId || !category || !name || !price || !duration) {
            res.status(400).json({ message: 'Artist ID, category, name, price, and duration are required.' });
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
            message: 'Service created successfully for the artist.',
            data: newService
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all services for a specific artist (can be used by admin or public)
// @route   GET /api/services/artist/:artistId
// @access  Public
export const getArtistServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const artistId = req.params.artistId;
        const services = await Service.find({ artist: artistId });

        res.status(200).json({
            count: services.length,
            data: services
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a specific service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const serviceId = req.params.id;

        // UPDATED: Ownership check is removed as only admin can access this.
        const updatedService = await Service.findByIdAndUpdate(serviceId, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedService) {
            res.status(404).json({ message: 'Service not found.' });
            return;
        }

        res.status(200).json({
            message: 'Service updated successfully.',
            data: updatedService
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete a specific service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const serviceId = req.params.id;

        // UPDATED: Ownership check is removed.
        const service = await Service.findById(serviceId);

        if (!service) {
            res.status(404).json({ message: 'Service not found.' });
            return;
        }

        await service.deleteOne();

        res.status(200).json({ message: 'Service deleted successfully.' });

    } catch (error) {
        next(error);
    }
};
