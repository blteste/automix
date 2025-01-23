import { useEffect, useState } from 'react';
import { Trash, Search } from 'lucide-react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";

const Cars = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLetter, setFilterLetter] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterType, setFilterType] = useState<string>('todos'); 
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token não encontrado');
      return;
    }
  
    
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
    });
    if (filterType !== 'todos') queryParams.append('type', filterType);
  
    fetch(`/api/cars?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCars(data.cars);
        setTotalPages(data.totalPages);
        setFilteredCars(data.cars);
      })
      .catch((error) => console.error('Erro ao carregar carros:', error));
  
  
    fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error('A resposta de Utilizador não contém um array de "users".', data);
        }
      })
      .catch((error) => console.error('Erro ao carregar utilizadores:', error));
  }, [currentPage, itemsPerPage, filterType]);
  

  useEffect(() => {
    let filtered = cars;

    // Filtro de pesquisa
    filtered = filtered.filter((car) => {
      const brandMatch = car.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const modelMatch = car.model.toLowerCase().includes(searchQuery.toLowerCase());
      const priceMatch = car.price.toString().includes(searchQuery.toLowerCase());
      return brandMatch || modelMatch || priceMatch;
    });

  
    if (filterStatus !== 'todos') {
      filtered = filtered.filter((car) => car.status === filterStatus);
    }

    if (filterLetter) {
      filtered = filtered.filter((car) =>
        car.brand.charAt(0).toUpperCase() === filterLetter.toUpperCase()
      );
    }

   
    if (filterType !== 'todos') {
      filtered = filtered.filter((car) => car.type === filterType);
    }

    setFilteredCars(filtered);
  }, [searchQuery, cars, filterLetter, filterStatus, filterType]);

  const deleteCar = async (carId: number) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Token não fornecido.');
      return;
    }

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Carro excluído com sucesso!');
        setCars(cars.filter((car) => car.id !== carId)); 
      } else if (response.status === 404) {
        alert('Carro não encontrado.');
      } else {
        const error = await response.json();
        console.error('Erro ao excluir o carro:', error);
        alert(error.error || 'Erro ao excluir o carro.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao tentar excluir o carro.');
    }
  };

  const getUserNameById = (userId: number) => {
    if (Array.isArray(users)) {
      const user = users.find((user) => user.id === userId);
      return user ? user.name : 'Desconhecido';
    } else {
      console.error('users não é um array:', users);
      return 'Desconhecido';
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-[#0022FF]">Lista de Carros</h2>

      <div className="mb-6 flex justify-center items-center space-x-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="carro">Carro</option>
          <option value="mota">Mota</option>
          <option value="carrinha">Carrinha</option>
        </select>
      </div>

      <div className="mb-6 flex justify-center items-center space-x-4">
        <div className="relative w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
          <input
            type="text"
            placeholder="Pesquisar carros..."
            className="w-full py-2 px-4 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-2 top-2.5 text-gray-400">
            <Search />
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-center items-center space-x-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos os Status</option>
          <option value="disponível">Disponível</option>
          <option value="indisponível">Indisponível</option>
        </select>

        <select
          value={filterLetter}
          onChange={(e) => setFilterLetter(e.target.value)}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as Letras</option>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letra) => (
            <option key={letra} value={letra}>
              {letra}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm border border-gray-200 shadow-lg rounded-lg bg-white">
          <thead className="bg-[#0022FF] text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Marca</th>
              <th className="px-4 py-3 text-left">Modelo</th>
              <th className="px-4 py-3 text-left">Preço</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Vendedor</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <tr key={car.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-4">{car.id}</td>
                  <td className="px-4 py-4">{car.brand}</td>
                  <td className="px-4 py-4">{car.model}</td>
                  <td className="px-4 py-4">{car.price}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${car.status === 'disponível' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {car.status === 'disponível' ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-4 py-4">{getUserNameById(car.userId)}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => deleteCar(car.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4">Sem carros disponíveis</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

   
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          </PaginationItem>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem key={index + 1}>
              <PaginationLink
                onClick={() => handlePageChange(index + 1)}
                isActive={index + 1 === currentPage}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Cars;
