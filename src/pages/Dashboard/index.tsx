import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const { data: foodsLoaded } = await api.get<IFoodPlate[]>('/foods');

      setFoods(foodsLoaded);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { data: newFoodAdded } = await api.post<IFoodPlate>('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, newFoodAdded]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { data: foodUpdated } = await api.put<IFoodPlate>(
        `/foods/${editingFood.id}`,
        {
          id: editingFood.id,
          available: editingFood.available,
          ...food,
        },
      );

      const foodsUpdated = foods.map(foodItem =>
        foodItem.id !== editingFood.id
          ? foodItem
          : {
              ...foodUpdated,
              ...food,
            },
      );

      setFoods(foodsUpdated);
    } catch (err) {}
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete(`/foods/${id}`);

      const foodsUpdated = foods.filter(food => food.id !== id);

      setFoods(foodsUpdated);
    } catch (err) {}
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
