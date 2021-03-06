import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dig from 'object-dig';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';

import EventIcon from '@material-ui/icons/Event';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import CardContainer from 'components/Card/CardContainer';
import Button from 'components/Button/Button';
import ModalDelete from 'components/Modal/ModalDelete';
import GridAction from 'components/Grid/GridAction';
import Table from 'components/Table/Table';
import tableStyles from 'components/Table/Table/styles';
import IconButton from 'components/Button/IconButton';
import InputDate from 'components/Input/InputDate';
import GridContainer from 'components/Grid/GridContainer';
import GridItem from 'components/Grid/GridItem';

import toQueryString from 'utils/toQueryString';
import handlingErros from 'utils/handlingErros';
import formatDate from 'utils/formatDate';

import api from 'services/api';
import { useAuth } from 'contexts/auth';
import Can from 'contexts/Can';

const List = () => {
  const { local } = useAuth();
  const classesTable = tableStyles();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(startOfMonth(Date.now()));
  const [endDate, setEndDate] = useState(endOfMonth(Date.now()));

  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [showModalDelete, setShowModalDelete] = useState(false);

  async function onDelete() {
    setLoadingDelete(true);

    try {
      await api.delete(`/tarefas/${deleteData.id}`, {});

      const newData = data.filter((p) => p.id !== deleteData.id);
      setDeleteData(null);
      setData(newData);
      setLoadingDelete(false);
      setShowModalDelete(false);
      toast.success('Exclu??do com sucesso!');
    } catch (error) {
      setLoadingDelete(false);
      handlingErros(error);
    }
  }

  useEffect(() => {
    async function getData() {
      setLoading(true);

      try {
        let query = {
          localId: dig(local, 'id'),
          startDate: formatDate(startDate, 'yyyy-MM-dd'),
          endDate: formatDate(endDate, 'yyyy-MM-dd'),
        };

        const params = toQueryString(query);
        const response = await api.get(`/tarefas${params}`);
        setLoading(false);
        const { data } = response;
        setData(data);
      } catch (error) {
        console.log(error);
        setLoading(false);
        handlingErros(error);
        setData([]);
      }
    }

    if (local) {
      getData();
    }
  }, [local, startDate, endDate]);

  return (
    <CardContainer
      Icon={EventIcon}
      iconColor="blue"
      title="Tarefas"
      loading={loading}
    >
      <GridAction>
        <Can I="new" a="Tarefas">
          <Button onClick={() => navigate('/tarefas/new')} color="blue">
            Novo
          </Button>
        </Can>
      </GridAction>

      <GridContainer>
        <GridItem xs={12} sm={4} md={4} lg={4} xl={4}>
          <InputDate
            label="Data de in??cio"
            value={startDate}
            onChange={setStartDate}
            required
          />
        </GridItem>
        <GridItem xs={12} sm={4} md={4} lg={4} xl={4}>
          <InputDate
            label="Data de fim"
            value={endDate}
            onChange={setEndDate}
            required
          />
        </GridItem>
      </GridContainer>

      <Table
        emptyData={data.length === 0}
        loading={loading}
        columns={
          <>
            <TableCell className={classesTable.cell}>A????es</TableCell>
            <TableCell className={classesTable.cell}>C??digo</TableCell>
            <TableCell className={classesTable.cell}>Data</TableCell>
            <TableCell className={classesTable.cell}>Atividade</TableCell>
            <TableCell className={classesTable.cell}>Operador</TableCell>
          </>
        }
      >
        {data.map((row) => {
          return (
            <TableRow key={row.id} hover className={classesTable.row}>
              <TableCell>
                <Can I="show" a="Tarefas">
                  <IconButton
                    tooltip="Exibir"
                    onClick={() => navigate(`/tarefas/show/${row.id}`)}
                    Icon={RemoveRedEyeIcon}
                    iconColor="green"
                  />
                </Can>
                <Can I="edit" a="Tarefas">
                  <IconButton
                    tooltip="Editar"
                    onClick={() => navigate(`/tarefas/edit/${row.id}`)}
                    Icon={EditIcon}
                    iconColor="orange"
                  />
                </Can>
                <Can I="delete" a="Tarefas">
                  <IconButton
                    tooltip="Excluir"
                    onClick={() => {
                      setDeleteData(row);
                      setShowModalDelete(true);
                    }}
                    Icon={DeleteIcon}
                    iconColor="red"
                  />
                </Can>
              </TableCell>
              <TableCell>{row.id}</TableCell>
              <TableCell>{formatDate(row.data, 'dd/MM/yyyy')}</TableCell>
              <TableCell>{row.atividade}</TableCell>
              <TableCell>{dig(row, 'user', 'nome')}</TableCell>
            </TableRow>
          );
        })}
      </Table>

      <ModalDelete
        open={showModalDelete}
        loading={loadingDelete}
        message="Realmente deseja excluir este dado?"
        buttonText="Excluir"
        onDelete={onDelete}
        onClose={() => {
          setShowModalDelete(false);
          setDeleteData(null);
        }}
      />
    </CardContainer>
  );
};

export default List;
