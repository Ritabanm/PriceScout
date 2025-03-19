//
//  ContentView.swift
//  PriceScout
//
//  Created by Ritaban Mitra on 12/03/25.
//
import SwiftUI
import UIKit
import TensorFlowLite

struct ContentView: View {
    @State private var image: UIImage? = nil
    @State private var showImagePicker = false
    @State private var deviceAge: Double = 0
    @State private var deviceCondition: Double = 5
    @State private var predictedPrice: String = "N/A"

    // TensorFlow Lite models
    var objectDetectionModel: Interpreter!
    var pricePredictionModel: Interpreter!

    init() {
        // Load TensorFlow Lite models
        self.objectDetectionModel = try? Interpreter(modelPath: Bundle.main.path(forResource: "object-detection", ofType: "tflite", inDirectory: "Models")!)
        self.pricePredictionModel = try? Interpreter(modelPath: Bundle.main.path(forResource: "price_predictor", ofType: "tflite", inDirectory: "Models")!)
    }

    var body: some View {
        VStack(spacing: 20) {
            Text("PriceScout")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.top, 40)

            Spacer()

            // Display selected image
            if let image = image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 250)
                    .cornerRadius(12)
                    .shadow(radius: 5)
            } else {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: 200, height: 200)
                    .overlay(
                        VStack {
                            Image(systemName: "photo")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 50, height: 50)
                                .foregroundColor(.gray)
                            Text("Select an Image")
                                .foregroundColor(.gray)
                                .font(.caption)
                        }
                    )
            }

            Spacer()

            // Slider for device age
            VStack {
                Text("Device Age: \(Int(deviceAge)) years")
                Slider(value: $deviceAge, in: 0...10, step: 1)
                    .padding(.horizontal)
            }

            // Slider for device condition
            VStack {
                Text("Device Condition: \(Int(deviceCondition)) / 10")
                Slider(value: $deviceCondition, in: 1...10, step: 1)
                    .padding(.horizontal)
            }

            // Estimated price text
            Text("Estimated Price: \(predictedPrice)")

            Button(action: {
                // Perform price estimation logic
                estimatePrice()
            }) {
                HStack {
                    Image(systemName: "tag")
                    Text("Estimate Price")
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(image != nil ? Color.green.opacity(0.9) : Color.gray.opacity(0.5))
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .padding(.horizontal)
            .disabled(image == nil)

            Spacer()
        }
        .padding()
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(selectedImage: $image)
        }
    }

    // Function to estimate price using regression model
    func estimatePrice() {
        // Preprocess image and make predictions using the object detection model
        guard let imageData = preprocessImage(image) else { return }
        let objectPrediction = try? runObjectDetectionModel(imageData)
        
        // Now use the device age, condition, and object prediction as inputs for price regressor
        let pricePrediction = try? runPricePredictionModel(age: deviceAge, condition: deviceCondition)
        predictedPrice = "$\(pricePrediction ?? 0.0)"
    }

    // Preprocessing function for image (resizing and normalization)
    func preprocessImage(_ image: UIImage?) -> [Float]? {
        guard let image = image else { return nil }
        let resizedImage = image.resized(to: CGSize(width: 224, height: 224))
        let pixelBuffer = resizedImage.pixelBuffer() // You may need to create this method

        return pixelBuffer
    }

    // Run object detection model (e.g., for detecting objects)
    func runObjectDetectionModel(_ imageData: [Float]) throws -> String {
        // Run object detection logic here
        // For example:
        let outputTensor = try objectDetectionModel.invoke(input: imageData)
        return outputTensor.debugDescription
    }

    // Run price prediction model using inputs
    func runPricePredictionModel(age: Double, condition: Double) throws -> Double {
        // Prepare inputs for the price regressor model
        let inputs: [Double] = [age, condition]
        let inputTensor = try Tensor(contentsOf: inputs)
        
        // Run price prediction
        let outputTensor = try pricePredictionModel.invoke(input: inputTensor)
        return outputTensor.floatValue
    }
}
